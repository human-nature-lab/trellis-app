import QuestionType from '../src/entities/trellis/QuestionType'
import { now } from '../src/services/DateService'
import uuidv4 from 'uuid/v4'
import AssignConditionTag from '../src/entities/trellis/AssignConditionTag'
import Choice from '../src/entities/trellis/Choice'
import ConditionTag from '../src/entities/trellis/ConditionTag'
import Form from '../src/entities/trellis/Form'
import FormSection from '../src/entities/trellis/FormSection'
import Locale from '../src/entities/trellis/Locale'
import Parameter from '../src/entities/trellis/Parameter'
import Question from '../src/entities/trellis/Question'
import QuestionChoice from '../src/entities/trellis/QuestionChoice'
import QuestionGroup from '../src/entities/trellis/QuestionGroup'
import QuestionParameter from '../src/entities/trellis/QuestionParameter'
import Section from '../src/entities/trellis/Section'
import SectionQuestionGroup from '../src/entities/trellis/SectionQuestionGroup'
import Skip from '../src/entities/trellis/Skip'
import SkipConditionTag from '../src/entities/trellis/SkipConditionTag'
import Translation from '../src/entities/trellis/Translation'
import { ConditionTagScope } from '../src/services/interview/InterviewDataInterface'
import TranslationService from '../src/services/TranslationService'
import { isUndefined } from '../src/services/util'
import PT from '../src/static/parameter.types'
import QT from '../src/static/question.types'
import {
  AnyAll,
  FormTemplate,
  PageTemplate,
  QuestionTemplate,
  SectionTemplate,
  ShowHide,
  SkipTemplate,
} from './FormBuilderTypes'

const english = new Locale().fromSnakeJSON({ id: '48984fbe-84d4-11e5-ba05-0800279114ca', language_tag: 'en' })

export class FormBuilder {
  readonly form: Form

  constructor (form?: Form) {
    this.form = form || new Form()
    this.init()
  }

  timestamp (obj: {createdAt: any, updatedAt: any, deletedAt: any}) {
    obj.createdAt = now()
    obj.updatedAt = now()
    obj.deletedAt = null
  }

  init () {
    this.form.id = uuidv4()
    this.form.formMasterId = this.form.id
    this.form.version = 1
    this.form.isPublished = true
    if (!this.form.sections) {
      this.form.sections = []
    }
    this.timestamp(this.form)
  }

  addSkip (page: QuestionGroup, skip: SkipTemplate) {
    const s = new Skip()
    s.anyAll = skip.anyAll === AnyAll.ANY
    s.showHide = skip.showHide === ShowHide.SHOW
    s.precedence = skip.sortOrder || page.skips.length
    s.conditionTags = []
    for (const c of skip.conditions) {
      const sct = new SkipConditionTag()
      s.conditionTags.push(sct)
      this.timestamp(s)
      sct.conditionTagName = c.conditionTag
    }
    page.skips.push(s)
  }

  addQuestion (page: QuestionGroup, question: QuestionTemplate) {
    if (!page.questions) {
      page.questions = []
    }
    const q = new Question()
    q.id = question.id || uuidv4()
    q.sortOrder = question.sortOrder || page.questions.length
    q.varName = question.varName
    q.assignConditionTags = []
    q.questionTypeId = QT[question.questionType]
    q.questionType = new QuestionType()
    q.questionType.id = q.questionTypeId
    q.questionType.name = question.questionType
    this.timestamp(q.questionType)
    if (question.assignConditionTags) {
      q.assignConditionTags = question.assignConditionTags.map(act => {
        const a = new AssignConditionTag()
        a.scope = act.scope || ConditionTagScope.SURVEY
        a.logic = typeof act.logic === 'string' ? act.logic : act.logic.toString()
        a.conditionTagId = act.conditionTag
        a.conditionTag = new ConditionTag()
        a.conditionTag.name = act.conditionTag
        a.conditionTag.id = a.conditionTagId
        this.timestamp(a)
        this.timestamp(a.conditionTag)
        return a
      })
    }
    q.choices = []
    if (question.choices) {
      q.choices = question.choices.map((c, i) => {
        const qc = new QuestionChoice()
        qc.choice = new Choice()
        if (typeof c === 'string') {
          qc.choice.id = uuidv4()
          qc.choice.choiceTranslation = this.makeTranslation(c)
          qc.choice.val = c
        } else {
          qc.choice.id = c.id || uuidv4()
          qc.choice.choiceTranslation = this.makeTranslation(c.label)
          qc.choice.val = c.val as string
          qc.sortOrder = c.sortOrder || i
        }
        this.timestamp(qc)
        this.timestamp(qc.choice)
        return qc
      })
    }
    q.questionParameters = []
    if (question.parameters) {
      q.questionParameters = question.parameters.map(p => {
        const qp = new QuestionParameter()
        this.timestamp(qp)
        qp.parameter = new Parameter()
        qp.parameter.name = p.type
        qp.parameter.id = PT[p.type]
        qp.parameterId = PT[p.type]
        qp.val = p.val as string
        return qp
      })
    }
    this.timestamp(q)
    page.questions.push(q)
  }

  addPage (section: Section, page: PageTemplate) {
    if (!section.questionGroups) {
      section.questionGroups = []
    }
    const p = new QuestionGroup()
    p.id = page.id || uuidv4()
    p.skips = []
    p.sectionQuestionGroup = new SectionQuestionGroup()
    p.sectionQuestionGroup.randomizeQuestions = !!page.randomizeQuestions
    p.sectionQuestionGroup.questionGroupOrder = page.sortOrder || section.questionGroups.length
    this.timestamp(p.sectionQuestionGroup)
    this.timestamp(p)
    if (page.questions) {
      for (const q of page.questions) {
        this.addQuestion(p, q)
      }
    }
    if (page.skips) {
      for (const s of page.skips) {
        this.addSkip(p, s)
      }
    }
    section.questionGroups.push(p)
  }

  makeTranslation (text: string, localeId: string = english.id): Translation {
    const t = new Translation().fromSnakeJSON({
      id: uuidv4(),
      translation_text: [{
        translated_text: text,
        locale_id: localeId,
      }],
    })
    this.timestamp(t)
    this.timestamp(t.translationText[0])
    return t
  }

  addSection (section: SectionTemplate) {
    if (!this.form.sections) {
      this.form.sections = []
    }
    const s = new Section().fromSnakeJSON(section)
    s.id = section.id || uuidv4()
    s.formSections = []
    this.timestamp(s)
    s.nameTranslation = this.makeTranslation(section.label || '', null)
    s.followUpQuestionId = section.followUpQuestionId
    s.formSections.push(new FormSection())
    s.formSections[0].sortOrder = section.sortOrder || this.form.sections.length
    s.formSections[0].randomizeFollowUp = !!section.randomizeFollowUp
    s.formSections[0].followUpQuestionId = section.followUpQuestionId
    s.formSections[0].isRepeatable = !!section.isRepeatable
    s.formSections[0].maxRepetitions = section.maxRepetitions || 0
    s.formSections[0].randomizePages = !!section.randomizePages
    this.timestamp(s.formSections[0])
    for (const p of section.pages) {
      this.addPage(s, p)
    }
    this.form.sections.push(s)
    return this
  }

  static formToTemplate (form: Form): FormTemplate {
    const f = { sections: [] }
    const questionIdMap: Map<string, QuestionTemplate> = new Map()
    form.sections.sort((a, b) => a.formSections[0].sortOrder - b.formSections[0].sortOrder)
    for (const section of form.sections) {
      const s = {
        label: TranslationService.getAny(section.nameTranslation, english),
        pages: [],
        sortOrder: +section.formSections[0].sortOrder,
        isRepeatable: !!section.formSections[0].isRepeatable,
        maxRepetitions: +section.formSections[0].maxRepetitions,
        followUpQuestionId: section.formSections[0].followUpQuestionId,
        randomizeFollowUp: !!section.formSections[0].randomizeFollowUp,
      }
      if (s.followUpQuestionId) {
        const q = questionIdMap.get(s.followUpQuestionId)
        q.id = s.followUpQuestionId
      }
      for (const page of section.questionGroups) {
        const p = {
          sortOrder: page.sectionQuestionGroup.questionGroupOrder,
          questions: [],
          skips: [],
        }
        for (const question of page.questions) {
          const q = {
            label: TranslationService.getAny(question.questionTranslation, english),
            questionType: question.questionType.name,
            varName: question.varName,
            sortOrder: question.sortOrder,
            choices: [],
            parameters: [],
            assignConditionTags: [],
          }
          questionIdMap.set(question.id, q)
          p.questions.push(q)
          for (const choice of question.choices) {
            q.choices.push({
              label: TranslationService.getAny(choice.choice.choiceTranslation, english),
              sortOrder: choice.sortOrder,
              val: choice.choice.val,
            })
          }
          for (const parameter of question.questionParameters) {
            q.parameters.push({
              type: parameter.parameter.name,
              val: parameter.val,
            })
          }
          for (const act of question.assignConditionTags) {
            q.assignConditionTags.push({
              conditionTag: act.conditionTag.name,
              scope: act.scope,
              logic: act.scope,
            })
          }
          q.choices.sort((a, b) => a.sortOrder - b.sortOrder)
        }
        for (const skip of page.skips) {
          p.skips.push({
            showHide: skip.showHide ? ShowHide.SHOW : ShowHide.HIDE,
            anyAll: skip.anyAll ? AnyAll.ANY : AnyAll.ALL,
            sortOrder: skip.precedence,
            conditions: skip.conditionTags.map(ct => ({
              conditionTag: ct.conditionTagName,
            })),
          })
        }
        p.questions.sort((a, b) => a.sortOrder - b.sortOrder)
        p.skips.sort((a, b) => a.sortOrder - b.sortOrder)
        s.pages.push(p)
      }
      s.pages.sort((a, b) => a.sortOrder - b.sortOrder)
      f.sections.push(s)
    }
    f.sections.sort((a, b) => a.sortOrder - b.sortOrder)
    return f
  }

  static stringify (obj: any, indents = 2, depth = 1): string {
    if (Array.isArray(obj)) {
      return '[' + obj.map(o => FormBuilder.stringify(o, indents, depth)).join(', ') + ']'
    } else if (typeof obj !== 'object' || isUndefined(obj)) {
      if (typeof obj === 'string') {
        return `'${obj}'`
      } else {
        return obj
      }
    } else {
      const props = Object
        .keys(obj)
        .map(key => `${' '.repeat(indents * depth)}${key}: ${FormBuilder.stringify(obj[key], indents, depth + 1)}`)
        .join(',\n')
      return `{\n${props}\n${' '.repeat(indents * (depth - 1))}}`
    }
  }

  static templateToTSFile (template: FormTemplate) {
    return `import { FormTemplate } from '../FormBuilderTypes'\nexport default ${FormBuilder.stringify(template)} as FormTemplate\n`
  }

  static fromTemplate (template: FormTemplate): FormBuilder {
    const builder = new FormBuilder()
    for (const section of template.sections) {
      builder.addSection(section)
    }
    return builder
  }
}
