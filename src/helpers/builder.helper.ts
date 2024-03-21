import { Ref, computed, inject } from 'vue'
import Question from '@/entities/trellis/Question'
import ConditionTag from '@/entities/trellis/ConditionTag'
import Form from '@/entities/trellis/Form'
import GeoType from '@/entities/trellis/GeoType'
import Parameter from '@/entities/trellis/Parameter'
import QuestionType from '@/entities/trellis/QuestionType'
import Locale from '@/entities/trellis/Locale'
import { builder, questionErrors } from '@/symbols/builder'
import { TranslateResult } from 'vue-i18n'
import { i18n } from '@/i18n'

type BuilderState = {
  form?: Form,
  locale?: Locale,
  locked: boolean,
  questionTypes: QuestionType[],
  parameters: Parameter[],
  conditionTags: ConditionTag[],
  geoTypes: GeoType[],
}

export function useBuilder () {
  return inject<BuilderState>(builder)
}

export function useQuestionErrors (questionId: () => string) {
  const errors = inject<Ref<Record<string, QuestionError[]>>>(questionErrors)
  return computed(() => errors.value ? errors.value[questionId()] : [])
}

export function useBuilderQuestions () {
  const builder = useBuilder()
  return computed(() => {
    const m: Record<string, Question> = {}
    if (!builder || !builder.form) {
      return m
    }
    for (const section of builder.form.sections) {
      for (const page of section.questionGroups) {
        for (const question of page.questions) {
          m[question.id] = question
        }
      }
    }
    return m
  })
}

export function useBuilderQuestionList () {
  const questions = useBuilderQuestions()
  return computed(() => Object.values(questions.value))
}

export type QuestionError = {
  referencedQuestionId?: string
  message: TranslateResult
}
export function useBuilderQuestionErrors (formWatcher: () => Form | null) {
  return computed<Record<string, QuestionError[]>>(() => {
    const form = formWatcher()
    if (!form || !form.sections) return {}
    const questionIdToVar = new Map<string, string>()
    const varNameMap = new Map<string, string[]>()
    for (const section of form.sections) {
      for (const page of section.questionGroups) {
        for (const question of page.questions) {
          const variable = question.varName.trim()
          questionIdToVar.set(question.id, variable)
          if (!varNameMap.has(variable)) {
            varNameMap.set(variable, [question.id])
          } else {
            varNameMap.get(variable).push(question.id)
          }
        }
      }
    }
    const conflicts: Record<string, QuestionError[]> = {}
    for (const ids of varNameMap.values()) {
      if (ids.length > 1) {
        for (const id of ids) {
          conflicts[id] = []
          const otherQuestionIds = ids.filter(i => i !== id)
          for (const otherId of otherQuestionIds) {
            conflicts[id].push({
              referencedQuestionId: otherId,
              message: i18n.t('builder.var_name_conflict'),
            })
          }
        }
      }
    }
    return conflicts
  })
}
