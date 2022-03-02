import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import { adminInst, builderInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import QuestionType from '../../entities/trellis/QuestionType'
import Section from '../../entities/trellis/Section'
import Question from '../../entities/trellis/Question'
import Parameter from '../../entities/trellis/Parameter'
import QuestionChoice from '../../entities/trellis/QuestionChoice'

class FormBuilderService {
  
  async getQuestionTypes (): Promise<QuestionType[]> {
    const res = await adminInst.get('/question/type')
    return res.data.questionTypes.map(t => new QuestionType().fromSnakeJSON(t))
  }
  
 
  async updateSectionQuestionGroup (sqg: SectionQuestionGroup): Promise<SectionQuestionGroup> {
    const res = await builderInst.put(uriTemplate('/section-group/{id}', [sqg.id]), sqg)
    return new SectionQuestionGroup().fromSnakeJSON(res.data)
  }

  async updateQuestionGroup (page: QuestionGroup): Promise<QuestionGroup> {
    const res = await builderInst.put(uriTemplate('/section/group/{page}', [page.id]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }
  
  async newQuestionGroup (sectionId: string): Promise<QuestionGroup> {
    const res = await builderInst.post(uriTemplate('/section/{section_id}/group', [sectionId]))
    return new QuestionGroup().fromSnakeJSON(res.data)
  }

  async deleteQuestionGroup (pageId: string): Promise<void> {
    return builderInst.delete(uriTemplate('/section/group/{group}', [pageId]))
  }
  
  async createSection(formId: string) {
    const res = await builderInst.post(uriTemplate('{form}/section', [formId])) 
    return new Section().fromSnakeJSON(res.data)
  }
  
  async updateQuestion(question: Question) {
    const res = await builderInst.put(uriTemplate('/question/{question}', [question.id]), question.toSnakeJSON())
    return new Question().fromSnakeJSON(res.data)
  }
  
  async getParameterTypes() {
    const res = await adminInst.get('study/parameter/types')
    return res.data.parameters.map(p => new Parameter().fromSnakeJSON(p))
  }

  async createQuestionChoice(questionId: string) {
    const res = await builderInst.post(uriTemplate('question/{question_id}/choice', [questionId]))
    return new QuestionChoice().fromSnakeJSON(res.data.choice) 
  }

  async removeQuestionChoice(choice: QuestionChoice) {
    await builderInst.delete(uriTemplate('choice/{choice_id}', [choice.id]))
  }

}

export default new FormBuilderService()