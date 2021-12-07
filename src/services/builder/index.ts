import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import QuestionType from '../../entities/trellis/QuestionType'

export default class FormBuilderService {
  
  static async getQuestionTypes (): Promise<QuestionType[]> {
    const res = await adminInst.get('question/type')
    return res.data.questionTypes.map(t => new QuestionType().fromSnakeJSON(t))
  }
  
  static async updateSectionQuestionGroup (sqg: SectionQuestionGroup): Promise<SectionQuestionGroup> {
    const res = await adminInst.put(uriTemplate('form/section-group/{id}', [sqg.id]), sqg)
    return new SectionQuestionGroup().fromSnakeJSON(res.data)
  }

  static async updateQuestionGroup (page: QuestionGroup): Promise<QuestionGroup> {
    const res = await adminInst.put(uriTemplate('form/section/group/{page}', [page.id]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }
  
  static async newQuestionGroup (sectionId: string, page: QuestionGroup): Promise<QuestionGroup> {
    const res = await adminInst.post(uriTemplate('form/section/{section_id}/group', [sectionId]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }

  static async removeQuestionGroup (pageId: string): Promise<void> {
    return adminInst.delete(uriTemplate('form/section/group/{group}', [pageId]))
  }

}
