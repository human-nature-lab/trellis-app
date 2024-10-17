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
import Skip from '../../entities/trellis/Skip'
import FormSection from '../../entities/trellis/FormSection'
import StudyForm from '../../entities/trellis/StudyForm'
import Translation from '@/entities/trellis/Translation'


type questionPayload = { translated_text: string, var_name: string, question_type_id: string, locale_id }
type pageSkipPayload = { show_hide: boolean, any_all: boolean, precedence: number, conditions: { condition_tag_name: string }[]}
class FormBuilderService {
  async getQuestionTypes (): Promise<QuestionType[]> {
    const res = await adminInst.get('/question/type')
    return res.data.questionTypes.map(t => new QuestionType().fromSnakeJSON(t))
  }

  async updateSectionQuestionGroup (sqg: SectionQuestionGroup) {
    await builderInst.put(uriTemplate('/section-question-group/{id}', [sqg.id]), sqg.toSnakeJSON())
  }

  async updateQuestionGroup (page: QuestionGroup): Promise<QuestionGroup> {
    const res = await builderInst.put(uriTemplate('/group/{page}', [page.id]), page)
    return new QuestionGroup().fromSnakeJSON(res.data)
  }

  async newQuestionGroup (sectionId: string): Promise<QuestionGroup> {
    const res = await builderInst.post(uriTemplate('/section/{section_id}/group', [sectionId]))
    return new QuestionGroup().fromSnakeJSON(res.data.questionGroup)
  }

  async removeQuestionGroup (pageId: string): Promise<void> {
    return builderInst.delete(uriTemplate('/group/{group}', [pageId]))
  }

  async createSection (formId: string, body: { sort_order: number }) {
    const res = await builderInst.post(uriTemplate('{form}/section', [formId]), body)
    return new Section().fromSnakeJSON(res.data.section)
  }

  async getStudyFormSections (studyId: string) {
    const res = await builderInst.get(uriTemplate('/study/{study}/sections', [studyId]))
    return res.data.study_forms.map(sf => new StudyForm().fromSnakeJSON(sf))
  }

  async linkSection (formId: string, sectionId: string) {
    const res = await builderInst.post(uriTemplate('/form/{form}/section/{section}', [formId, sectionId]))
    return new FormSection().fromSnakeJSON(res.data.form_section)
  }

  async updateFormSection (section: FormSection) {
    const res = await builderInst.put(uriTemplate('/form_section/{section}', [section.id]), section.toSnakeJSON())
    return new FormSection().fromSnakeJSON(res.data.section.form_sections[0])
  }

  async removeSection (formSectionId: string) {
    await builderInst.delete(uriTemplate('section/{section}', [formSectionId]))
  }

  async createQuestion (pageId: string, question: questionPayload) {
    const res = await builderInst.post(uriTemplate('/group/{group}/question', [pageId]), question)
    return new Question().fromSnakeJSON(res.data.question)
  }

  async createTranslation () {
    const res = await builderInst.put('/translation')
    return new Translation().fromSnakeJSON(res.data.translation)
  }

  async duplicateQuestion (pageId: string, question: Question, newVarName: string) {
    const uri = uriTemplate('/group/{group}/question/{question}/duplicate', [pageId, question.id])
    const res = await builderInst.post(uri, null, {
      params: {
        var_name: newVarName,
      },
    })
    return new Question().fromSnakeJSON(res.data.question)
  }

  async updateQuestion (question: Question) {
    const res = await builderInst.put(uriTemplate('/question/{question}', [question.id]), question.toSnakeJSON())
    return new Question().fromSnakeJSON(res.data)
  }

  async removeQuestion (questionId: string) {
    return builderInst.delete(uriTemplate('/question/{question}', [questionId]))
  }

  async getParameterTypes () {
    const res = await adminInst.get('study/parameter/types')
    return res.data.parameters.map(p => new Parameter().fromSnakeJSON(p))
  }

  async createQuestionChoice (questionId: string) {
    const res = await builderInst.post(uriTemplate('question/{question_id}/choice', [questionId]))
    return new QuestionChoice().fromSnakeJSON(res.data.choice)
  }

  async removeQuestionChoice (choice: QuestionChoice) {
    await builderInst.delete(uriTemplate('choice/{choice_id}', [choice.id]))
  }

  async updateChoice ({ questionChoiceId, val }: { questionChoiceId: string, val: string }) {
    await builderInst.put(uriTemplate('choice/{choice_id}', [questionChoiceId]), { id: questionChoiceId, val })
  }

  async updateQuestionChoice (qc: QuestionChoice) {
    await builderInst.put(uriTemplate('question/choice/{id}', [qc.id]), qc.toSnakeJSON())
  }

  async createOrUpdateParameter (param: { id?: string, question_id: string, name: string, val: string }) {
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

  async updateAssignConditionTag (questionId: string, tag: { id: string, logic: string, scope: string, condition: ConditionTag }) {
    const res = await builderInst.put(uriTemplate('question/{}/assign_condition_tag', [questionId]), tag)
    return new AssignConditionTag().fromSnakeJSON(res.data.assign_condition_tag)
  }

  async deleteAssignConditionTag (tag: { id: string }) {
    await builderInst.delete(uriTemplate('condition/{id}', [tag.id]))
  }

  async createConditionTag (tag: string) {
    const res = await builderInst.post('/condition-tag', { tag })
    return new ConditionTag().fromSnakeJSON(res.data.condition)
  }

  async createPageSkip (pageId: string, data: pageSkipPayload) {
    const res = await builderInst.post(uriTemplate('/group/{page}/skip', [pageId]), data)
    return new Skip().fromSnakeJSON(res.data.question_group_skip.skip)
  }

  async updateSkip (skip: Skip, conditionTags?: string[]) {
    const data = skip.toSnakeJSON({ includeRelationships: true })
    if (conditionTags) {
      data.conditions = conditionTags.map(c => ({ condition_tag_name: c }))
    }
    const res = await builderInst.put(uriTemplate('/skip/{skip}', [skip.id]), data)
    return new Skip().fromSnakeJSON(res.data.skip)
  }

  async removePageSkip (skipId: string) {
    return builderInst.delete(uriTemplate('/group/skip/{id}', [skipId]))
  }
}

export default new FormBuilderService()
