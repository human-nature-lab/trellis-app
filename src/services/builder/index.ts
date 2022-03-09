import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import { adminInst, builderInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import QuestionType from '../../entities/trellis/QuestionType'
import Section from '../../entities/trellis/Section'
import Question from '../../entities/trellis/Question'
import Parameter from '../../entities/trellis/Parameter'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import QuestionParameter from '../../entities/trellis/QuestionParameter'
import AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'

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

  async updateQuestionChoice(choice: QuestionChoice) {
    await builderInst.put(uriTemplate('choice/{choice_id}', [choice.id]), choice)
  }
  
  async createOrUpdateParameter (param: { id: string, question_id: string, name: string, val: string }) {
    const res = await builderInst.post(uriTemplate('question/{question_id}/parameter', [param.question_id]), param)
    return new QuestionParameter().fromSnakeJSON(res.data.parameter)
  }
  
  async deleteQuestionParameter (param: { id: string }) {
    await builderInst.delete(uriTemplate('parameter/{parameter_id}', [param.id]))
  }
  
  async createAssignConditionTag (questionId: string, tag: { logic: string, scope: string, condition: ConditionTag }) {
    const res = await builderInst.post(uriTemplate('question/{question_id}/assign_condition_tag', [questionId]), tag)
    return new AssignConditionTag().fromSnakeJSON(res.data.assign_condition_tag)
  }

  async updateAssignConditionTag(questionId: string, tag: { logic: string, scope: string, condition: ConditionTag }) {
    const res = await builderInst.put(uriTemplate('question/{}/assign_condition_tag', [questionId]), tag)
    return new AssignConditionTag().fromSnakeJSON(res.data.assign_condition_tag)
  }
  
  async deleteAssignConditionTag(tag: { id: string }) {
    await builderInst.delete(uriTemplate('condition/{id}', [tag.id]))
  }
  
  async createConditionTag(tag: string) {
    const res = await builderInst.post('/condition-tag', { tag })
    return new ConditionTag().fromSnakeJSON(res.data.condition)
  }

}

export default new FormBuilderService()