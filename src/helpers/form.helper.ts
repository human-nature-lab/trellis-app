import { ref, watch, WatchSource } from 'vue'
import Form from '@/entities/trellis/Form'
import AssignConditionTag from '@/entities/trellis/AssignConditionTag'
import SaferEvalService from '@/services/SaferEvalService'

type MissingTranslation = { message: string, localeId: string } & (
  | { questionId?: string }
  | { sectionId?: string }
  | { pageId?: string }
)

type DuplicateVarName = { message: string, varName: string, questionIds: string[] }
type SkipIssue = { message: string, conditionTagName?: string, pageId?: string }
type InvalidVarNameInConditionAssignment = { message: string, varName: string, questionId: string }

type FormError = MissingTranslation | DuplicateVarName | SkipIssue | InvalidVarNameInConditionAssignment

const safeEval = new SaferEvalService()
export function extractConditionAssignmentVarNames (act: AssignConditionTag): string[] {
  const referencedVars = new Set<string>()
  const referencedConditionTags = new Set<string>()
  // our assignment funciton is a string that looks like this: 'function(vars, data, conditionTags) {}'
  safeEval.register(act.id, act.logic)
  const objectTracker = new Proxy({}, {
    set: (target, prop, value) => {
      referencedVars.add(prop as string)
      target[prop] = value
      return true
    },
    get: (target, prop) => {
      referencedVars.add(prop as string)
      return ''
    },
  })
  const apiTracker = {
    data: {
      get (key: string) {
        referencedVars.add(key)
        return ''
      },
    },
    conditionTags: {
      get (key: string) {
        referencedConditionTags.add(key)
        return true
      },
    },
  }
  try {
    safeEval.run(act.id, objectTracker, apiTracker)
  } catch (err) {
    console.error(err)
  } finally {
    safeEval.clear()
  }
  return Array.from(referencedVars)
}

type PageRecord = {
  // Var names that are defined in questions on this page
  QuestionVarNames: string[],
  // Condition tags that are assigned on this page
  AssigningConditionVarNames: string[],
  // Condition tags that are used in skips on this page
  SkipVarNames: string[],
  // Var names that are referenced in condition assignments on this page
  ReferencedVarNames: string[],
}

export function validateForm (form: Form): FormError[] {
  const errors: FormError[] = []
  const varNameMap = new Map<string, string[]>()
  const pages: PageRecord[] = []
  // TODO: Check for skip conditions defined out of order (after the question they skip)

  const allLocaleIds = new Set<string>()
  const localeQuestionIdMap = new Map<string, Set<string>>()
  const referencedVarNames = new Map<string, string[]>()
  const definedVarNames = new Set<string>()
  const definedConditionTags = new Set<string>()
  for (const section of form.sections) {
    for (const page of section.pages) {
      // Here we check that all skip condition tags are defined before they are used
      if (page.skips && page.skips.length > 0) {
        for (const skip of page.skips) {
          for (const ct of skip.conditionTags) {
            if (!definedConditionTags.has(ct.conditionTagName.trim())) {
              errors.push({
                message: `skip condition tag '${ct.conditionTagName.trim()}' may not be defined`,
                conditionTagName: ct.conditionTagName.trim(),
                pageId: page.id,
              })
            }
          }
        }
      }
      for (let q = 0; q < page.questions.length; q++) {
        const question = page.questions[q]
        localeQuestionIdMap.set(question.id, new Set<string>())
        for (const tt of question.questionTranslation.translationText) {
          allLocaleIds.add(tt.localeId)
          if (tt.translatedText.trim().length > 0) {
            localeQuestionIdMap.get(question.id)?.add(tt.localeId)
          }
        }
        definedVarNames.add(question.varName)
        varNameMap.set(question.varName, [...(varNameMap.get(question.varName) || []), question.id])

        // Check that all variables used in condition assignment are defined properly. This doesn't handle complex 
        // condition assignments if there is branching that might prevent the condition from being evaluated/accessed if
        // it doesn't meet specific criteria. It works extremely well for simple cases though.
        if (question.assignConditionTags && question.assignConditionTags.length > 0) {
          for (const act of question.assignConditionTags) {
            const usedVarNames = extractConditionAssignmentVarNames(act)
            referencedVarNames.set(question.id, usedVarNames)
            for (const varName of usedVarNames) {
              if (!definedVarNames.has(varName)) {
                errors.push({
                  message: `variable '${varName}' referenced in condition assignment before it is defined`,
                  varName,
                  questionId: question.id,
                })
              }
            }
            definedConditionTags.add(act.conditionTag.name.trim())
          }
        }
      }
    }
  }

  // Check for missing translations
  for (const [questionId, foundLocales] of localeQuestionIdMap.entries()) {
    for (const expectedLocaleId of allLocaleIds) {
      if (!foundLocales.has(expectedLocaleId)) {
        errors.push({ message: 'Missing translation', localeId: expectedLocaleId, questionId })
      }
    }
  }

  // Check if we have duplicate var names
  for (const [varName, questionIds] of varNameMap.entries()) {
    if (questionIds.length > 1) {
      errors.push({ message: 'Duplicate var name', varName, questionIds })
    }
  }

  // Check if we have referenced var names that aren't present in the form
  for (const [questionId, refs] of referencedVarNames.entries()) {
    for (const varName of refs) {
      if (!varNameMap.has(varName)) {
        errors.push({ message: `variable ${varName} is referenced in condition assignment but not defined in the form`, varName, questionId })
      }
    }
  }

  console.log('found errors', errors)

  return errors
}

export function useFormValidation (form: WatchSource<Form>) {
  const valid = ref(true)
  const errors = ref<FormError[]>([])
  watch(form, f => {
    if (!f) {
      return
    }
    errors.value = validateForm(f)
    valid.value = errors.value.length === 0
  }, { immediate: true, deep: true })
  return { valid, errors }
}
