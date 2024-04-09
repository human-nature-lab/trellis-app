import {
  Form,
  Section,
  QuestionGroup,
  Question,
  Skip,
  ConditionTag,
  SkipConditionTag,
  Choice,
  Translation,
  TranslationText,
  AssignConditionTag,
  QuestionChoice,
  Parameter,
  QuestionParameter,
  Respondent,
  Interview,
  Survey,
  Locale,
} from '../src/entities/trellis'
import ParameterType from '../src/static/parameter.types'
import InterviewLoader, { InterviewData } from '../src/components/interview/services/InterviewLoader'
import uuidv4 from 'uuid/v4'
import { ConditionTagScope } from '../src/services/interview/InterviewDataInterface'
import InterviewManager from '../src/components/interview/classes/InterviewManager'

const englishLocale = new Locale()
englishLocale.id = '48984fbe-84d4-11e5-ba05-0800279114ca'
englishLocale.languageTag = 'en'
englishLocale.languageName = 'English'
englishLocale.languageNative = 'English'

function newTranslation (text: string): Translation {
  const t = new Translation()
  t.id = uuidv4()
  t.translationText = [new TranslationText().fromSnakeJSON({
    id: uuidv4(),
    translated_text: text,
    locale_id: englishLocale.id,
  })]
  return t
}

class TestQuestion {
  constructor (private question: Question) {}

  addChoice (val: string, text?: string): this {
    const c = new Choice()
    c.id = uuidv4()
    c.val = val
    c.choiceTranslation = newTranslation(text || val)
    c.choiceTranslationId = c.choiceTranslation.id
    const qc = new QuestionChoice()
    qc.choice = c
    qc.questionId = this.question.id
    qc.choiceId = c.id
    qc.id = uuidv4()
    this.question.choices.push(qc)
    return this
  }

  addAssignment (tagName: string, logic: string): this {
    const act = new AssignConditionTag()
    act.id = uuidv4()
    act.logic = logic
    act.conditionTag = new ConditionTag()
    act.conditionTag.id = uuidv4()
    act.conditionTag.name = tagName
    return this
  }

  addParameter (id: ParameterType, value: string): this {
    const qp = new QuestionParameter()
    qp.id = uuidv4()
    qp.parameter = new Parameter()
    qp.parameter.id = '' + id
    qp.parameter.name = ParameterType[id]
    qp.val = value
    this.question.questionParameters.push(qp)
    return this
  }
}

class TestPage {
  constructor (private page: QuestionGroup) {}

  addQuestion (typeId: string): TestQuestion {
    const q = new Question()
    q.questionTypeId = typeId
    this.page.questions.push(q)
    return new TestQuestion(q)
  }

  addSkip (showHide: boolean, anyAll: boolean, conditionNames: string[]): this {
    const s = new Skip()
    s.showHide = showHide
    s.anyAll = anyAll
    s.conditionTags = conditionNames.map(name => {
      const sct = new SkipConditionTag()
      sct.id = uuidv4()
      sct.conditionTagName = name
      return sct
    })
    this.page.skips.push(s)
    return this
  }

  hideIfAny (conditionNames: string[]) {
    return this.addSkip(false, true, conditionNames)
  }

  hideIfAll (conditionNames: string[]) {
    return this.addSkip(false, false, conditionNames)
  }

  showIfAny (conditionNames: string[]) {
    return this.addSkip(true, true, conditionNames)
  }

  showIfAll (conditionNames: string[]) {
    return this.addSkip(true, false, conditionNames)
  }
}

class TestSection {
  constructor (private section: Section) {
  }

  addPage (): TestPage {
    const p = new QuestionGroup()
    this.section.pages.push(p)
    return new TestPage(p)
  }
}

export class TestForm {
  public form = new Form()

  setName (name: string): this {
    this.form.id = uuidv4()
    this.form.nameTranslation = newTranslation(name)
    this.form.nameTranslationId = this.form.nameTranslation.id
    return this
  }

  addSection (): TestSection {
    const s = new Section()
    this.form.sections.push(s)
    return new TestSection(s)
  }

  async loadManager (req: Partial<InterviewData> = {}): Promise<InterviewManager> {
    let {
      data,
      respondent,
      form,
      locale,
      actions,
      interview,
      interviewType,
      respondentFills,
      conditionTags,
      baseRespondentConditionTags,
    } = req
    if (!interviewType) {
      interviewType = 'interview'
    }
    if (!respondent) {
      respondent = new Respondent()
      respondent.id = uuidv4()
    }
    if (!interview) {
      interview = new Interview()
      interview.id = uuidv4()
    }
    if (!interview.survey) {
      interview.survey = new Survey()
      interview.survey.id = uuidv4()
      interview.survey.respondentId = respondent.id
      interview.surveyId = interview.survey.id
    }
    if (!form) {
      form = this.form
    }
    if (!locale) {
      locale = englishLocale.copy()
    }
    if (!actions) {
      actions = []
    }
    if (!data) {
      data = {
        conditionTags: {
          [ConditionTagScope.RESPONDENT]: [],
          [ConditionTagScope.SURVEY]: [],
          [ConditionTagScope.SECTION]: [],
        },
        data: [],
      }
    }
    if (!baseRespondentConditionTags) {
      baseRespondentConditionTags = InterviewLoader.getBaseConditionTags(form, data)
    }

    const manager = new InterviewManager(
      interview,
      form,
      actions,
      data,
      conditionTags,
      respondentFills,
      baseRespondentConditionTags,
    )
    await manager.initialize()
    return manager
  }
}
