import { uniqueId } from 'lodash'
import Form from '../../src/entities/trellis/form'
import Question from '../../src/entities/trellis/Question'
import QuestionGroup from '../../src/entities/trellis/QuestionGroup'
import Section from '../../src/entities/trellis/Section'

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
  for (const section of def.sections) {
    const s = new Section().fromSnakeJSON(section)
    if (!s.id) {
      s.id = uniqueId()
    }
    for (const page of section.pages) {
      const p = new QuestionGroup().fromSnakeJSON(page)
      if (!p.id) {
        p.id = uniqueId()
      }
      for (const question of page.questions) {
        const q = new Question().fromSnakeJSON(question)
        if (!q.id) {
          q.id = uniqueId()
        }
      }
      s.pages.push(p)
    }
    form.sections.push(s)
  }
  return form
}