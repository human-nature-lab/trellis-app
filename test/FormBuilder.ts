import { now } from 'moment'
import uuidv4 from 'uuid/v4'
import AssignConditionTag from '../src/entities/trellis/AssignConditionTag'
import Choice from '../src/entities/trellis/Choice'
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
import TranslationService from '../src/services/TranslationService'
import PT from '../src/static/parameter.types'
import {
  AnyAll,
  FormTemplate,
  PageTemplate,
  QuestionTemplate,
  SectionTemplate,
  ShowHide,
  SkipTemplate
} from './FormBuilderTypes'

const english = new Locale().fromSnakeJSON({ id: '48984fbe-84d4-11e5-ba05-0800279114ca', language_tag: 'en' })

export class FormBuilder {
  private form: Form

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
    this.form.sections = []
    this.timestamp(this.form)
  }

  addSkip (page: QuestionGroup, skip: SkipTemplate) {
    const s = new Skip()
    s.anyAll = skip.anyAll === AnyAll.ANY
    s.showHide = skip.showHide === ShowHide.SHOW
    s.precedence = skip.sortOrder
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
    const q = new Question()
    q.sortOrder = question.sortOrder
    q.assignConditionTags = question.assignConditionTags.map(act => {
      const a = new AssignConditionTag()
      a.scope = act.scope
      a.logic = act.logic
      a.conditionTagId = act.conditionTag
      this.timestamp(a)
      return a
    })
    q.choices = question.choices.map(c => {
      const qc = new QuestionChoice()
      qc.choice = new Choice()
      qc.choice.choiceTranslation = this.makeTranslation(c.label, null)
      qc.choice.val = c.val as string
      qc.sortOrder = c.sortOrder
      this.timestamp(qc)
      this.timestamp(qc.choice)
      return qc
    })
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
    this.timestamp(q)
    page.questions.push(q)
  }

  addPage (section: Section, page: PageTemplate) {
    const p = new QuestionGroup()
    p.questions = []
    p.skips = []
    p.sectionQuestionGroup = new SectionQuestionGroup()
    p.sectionQuestionGroup.questionGroupOrder = page.sortOrder
    this.timestamp(p)
    for (const q of page.questions) {
      this.addQuestion(p, q)
    }
    for (const s of page.skips) {
      this.addSkip(p, s)
    }
    section.pages.push(p)
  }

  makeTranslation (text: string, localeId: string = english.id): Translation {
    const t = new Translation().fromSnakeJSON({
      id: uuidv4(),
      translation_text: [{
        translated_text: text,
        locale_id: localeId
      }]
    })
    this.timestamp(t)
    this.timestamp(t.translationText[0])
    return t
  }

  addSection (section: SectionTemplate) {
    const s = new Section().fromSnakeJSON(section)
    s.formSections = []
    this.timestamp(s)
    s.nameTranslation = this.makeTranslation(section.label, null)
    s.formSections.push(new FormSection())
    s.formSections[0].randomizeFollowUp = section.randomizeFollowUp
    s.formSections[0].followUpQuestionId = section.followUpQuestionId
    s.formSections[0].isRepeatable = section.isRepeatable
    s.formSections[0].maxRepetitions = section.maxRepetitions || 0
    for (const p of section.pages) {
      this.addPage(s, p)
    }
    this.form.sections.push(s)
  }

  static formToTemplate (form: Form): { form: FormTemplate } {
    const f = { sections: [] }
    for (const section of form.sections) {
      const s = {
        label: TranslationService.getAny(section.nameTranslation, english),
        pages: [],
        sortOrder: section.formSections[0].sortOrder,
        isRepeatable: section.formSections[0].isRepeatable,
        maxRepetitions: section.formSections[0].maxRepetitions,
        followUpQuestionId: section.formSections[0].followUpQuestionId,
        randomizeFollowUp: section.formSections[0].randomizeFollowUp
      }
      for (const page of section.questionGroups) {
        const p = {
          sortOrder: page.sectionQuestionGroup.questionGroupOrder,
          questions: [],
          skips: []
        }
        for (const question of page.questions) {
          const q = {
            label: TranslationService.getAny(question.questionTranslation, english),
            questionType: question.questionType.name,
            varName: question.varName,
            sortOrder: question.sortOrder,
            choices: [],
            parameters: [],
            assignConditionTags: []
          }
          p.questions.push(q)
          for (const choice of question.choices) {
            q.choices.push({
              label: TranslationService.getAny(choice.choice.choiceTranslation, english),
              sortOrder: choice.sortOrder,
              val: choice.choice.val
            })
          }
          for (const parameter of question.questionParameters) {
            q.parameters.push({
              type: parameter.parameter.name,
              val: parameter.val
            })
          }
          for (const act of question.assignConditionTags) {
            q.assignConditionTags.push({
              conditionTag: act.conditionTag.name,
              scope: act.scope,
              logic: act.scope
            })
          }
        }
        for (const skip of page.skips) {
          p.skips.push({
            showHide: skip.showHide ? ShowHide.SHOW : ShowHide.HIDE,
            anyAll: skip.anyAll ? AnyAll.ANY : AnyAll.ALL,
            sortOrder: skip.precedence,
            conditions: skip.conditionTags.map(ct => ({
              conditionTag: ct.conditionTagName
            }))
          })
        }
        s.pages.push(p)
      }
      f.sections.push(s)
    }

    return { form: f }
  }

  static fromTemplate (template: FormTemplate): FormBuilder {
    const builder = new FormBuilder()
    for (const section of template.sections) {
      builder.addSection(section)
    }
    return builder
  }
}
