import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import QuestionType from '../../entities/trellis/QuestionType'
import Section from '../../entities/trellis/Section'
import Question from '../../entities/trellis/Question'
import Parameter from '../../entities/trellis/Parameter'

export default class FormBuilderService {
  
  static async getQuestionTypes (): Promise<QuestionType[]> {
    const res = await adminInst.get('/question/type')
    return res.data.questionTypes.map(t => new QuestionType().fromSnakeJSON(t))
  }
  
  static async updateSectionQuestionGroup (sqg: SectionQuestionGroup): Promise<SectionQuestionGroup> {
    const res = await builderInst.put(uriTemplate('/section-group/{id}', [sqg.id]), sqg)
    return new SectionQuestionGroup().fromSnakeJSON(res.data)
  }

  static async updateQuestionGroup (page: QuestionGroup): Promise<QuestionGroup> {
    const res = await builderInst.put(uriTemplate('/section/group/{page}', [page.id]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }
  
  static async newQuestionGroup (sectionId: string, page: QuestionGroup): Promise<QuestionGroup> {
    const res = await builderInst.post(uriTemplate('form/section/{section_id}/group', [sectionId]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }

  static async removeQuestionGroup (pageId: string): Promise<void> {
    return builderInst.delete(uriTemplate('form/section/group/{group}', [pageId]))
  }
  
  static async createSection(formId: string) {
    const res = await builderInst.post(uriTemplate('{form}/section', [formId])) 
    return new Section().fromSnakeJSON(res.data)
  }
  
  static async updateQuestion(question: Question) {
    const res = await builderInst.put(uriTemplate('/question/{question}', [question.id]), question.toSnakeJSON())
    return new Question().fromSnakeJSON(res.data)
  }
  
  static async getParameterTypes() {
    const res = await adminInst.get('study/parameter/types')
    return res.data.parameters.map(p => new Parameter().fromSnakeJSON(p))
  }

}
