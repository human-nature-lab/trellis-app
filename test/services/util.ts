import { uniqueId } from 'lodash'
import Form from '../../src/entities/trellis/Form'
import Question from '../../src/entities/trellis/Question'
import QuestionGroup from '../../src/entities/trellis/QuestionGroup'
import Section from '../../src/entities/trellis/Section'
import QuestionDatum from '../../src/entities/trellis/QuestionDatum'
import Datum from '../../src/entities/trellis/Datum'

type BasicForm = {
  sections: {
    id?: string
    max_repetitions?: number
    is_repeatable?: boolean
    follow_up_question_id?: string
    pages: {
      id?: string
      questions: {
        id?: string
        var_name: string
        question_type_id?: string
      }[]
    }[]
  }[]
}

export function createForm (def: BasicForm): Form {
  const form = new Form()
  form.sections = []
  for (let i = 0; i < def.sections.length; i ++) {
    const section = def.sections[i]
    const s = new Section().fromSnakeJSON(section)
    if (!s.id) {
      s.id = uniqueId()
    }
    if (!s.questionGroups) {
      s.questionGroups = []
    }
    s.formSections = [{ id: uniqueId(), sectionId: s.id, sortOrder: i + 1 }]

    for (let j = 0; j < section.pages.length; j++) {
      const page = section.pages[j]
      const p = new QuestionGroup()
      p.sectionQuestionGroup = { id: uniqueId(), questionGroupOrder: j + 1 }
      if (!p.id) {
        p.id = uniqueId()
      }
      p.skips = []
      p.questions = []
      if (page.skips) {
        for (const s of page.skips) {
          p.skips.push(new Skip().fromSnakeJSON(s))
        }
      }
      for (let k = 0; k < page.questions.length; k++) {
        const question = page.questions[k]
        const q = new Question().fromSnakeJSON(question)
        if (!q.id) {
          q.id = uniqueId()
        }
        if (!q.sortOrder) {
          q.sortOrder = k
        }
        if (!q.assignConditionTags) {
          q.assignConditionTags = []
        }
        if (!q.parameters) {
          q.parameters = []
        }
        p.questions.push(q)
      }
      s.pages.push(p)
    }
    form.sections.push(s)
  }
  return form
}


type BasicQuestionDatum = {
  varName: string
  dkRf?: boolean
  dkRfVal?: string
  sectionRepetition?: number
  noOne?: boolean
  data?: Partial<Datum>[]
}

export function createFormData (form: Form, data: BasicQuestionDatum[]): QuestionDatum[] {
  const qMap = form.varNameQuestionMap()
  const res = []
  for (const d of data) {
    const question = qMap.get(d.varName)
    if (!question) {
      throw new Error(`invalid varName "${d.varName}"`)
    }
    const qd = new QuestionDatum()
    qd.questionId = question.id
    qd.dkRf = d.dkRf
    qd.dkRfVal = d.dkRfVal
    qd.noOne = d.noOne
    qd.sectionRepetition = d.sectionRepetition
    qd.data = d.data ? d.data.map(d => new Datum().fromSnakeJSON(d)) : []
    res.push(qd)
  }
  return res
}