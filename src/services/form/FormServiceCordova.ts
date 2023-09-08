import formTypes from '../../static/form.types'
import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import { In, IsNull, Not } from 'typeorm'
import { removeSoftDeleted } from '../database/SoftDeleteHelper'
import Section from '../../entities/trellis/Section'

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    const studyForms: StudyForm[] = await repo.find({
      where: {
        studyId: studyId,
        deletedAt: IsNull(),
        currentVersionId: Not(IsNull()),
      },
    })
    removeSoftDeleted(studyForms)
    for (const fs of studyForms) {
      if (fs.form) {
        fs.form.sort()
      }
    }
    studyForms.sort((a, b) => a.sortOrder - b.sortOrder)
    return studyForms
  }

  getAllStudyForms (studyId: string): Promise<StudyForm[]> {
    return this.getStudyForms(studyId)
  }

  async getForm (id: string, bareBones: boolean = false): Promise<Form> {
    console.log('getForm', id)
    const connection = await DatabaseService.getDatabase()
    const formRepository = await connection.getRepository(Form)

    const form: Form = await formRepository.findOne({
      where: {
        id: id,
      },
    })

    const q = 'select section_id from form_section where form_id = ? and deleted_at is null'
    const sectionIds = (await connection.query(q, [id])).map(s => s.section_id)
    form.sections = []
    const sectionRepository = await connection.getRepository(Section)

    for (const sId of sectionIds) {
      const section = await sectionRepository.findOne({ id: sId })
      form.sections.push(section)
    }

    const questionGroupMap = {}
    const questionGroupIds = []
    form.sections.forEach(s => s.filterFormSections(form.id))
    form.sections = form.sections.filter(s => s.formSections.length && !s.formSections[0].deletedAt)
    form.sections.forEach((section) => {
      section.questionGroups.forEach((questionGroup) => {
        questionGroup.questions = []
        questionGroupMap[questionGroup.id] = questionGroup
        questionGroupIds.push(questionGroup.id)
      })
    })

    const questionRepository = await connection.getRepository(Question)
    const questions = await questionRepository.find({
      where: {
        questionGroupId: In(questionGroupIds),
        deletedAt: IsNull(),
      },
    })

    questions.forEach((question) => {
      const questionGroup = questionGroupMap[question.questionGroupId]
      questionGroup.questions.push(question)
    })

    form.sort()

    console.log('finished form', form)
    console.log(JSON.stringify(form.toSnakeJSON({ includeRelationships: true })))

    removeSoftDeleted(form)
    console.log('form removed soft deleted')

    return form
  }

  createForm (studyId: string, formType: formTypes): Promise<StudyForm> {
    throw Error('Not implemented')
  }

  updateForm (form: Form): Promise<Form> {
    throw Error('Not implemented')
  }

  async updateStudyForm (studyId: string, studyForm: StudyForm): Promise<StudyForm> {
    throw Error('Not implemented')
  }

  exportForm (formId: string): Promise<any> {
    throw Error('Not implemented')
  }

  deleteForm (studyId: string, formId: string): Promise<any> {
    throw Error('Not implemented')
  }

  reorderForms (studyId: string, studyForms: StudyForm[]): Promise<StudyForm[]> {
    throw new Error('Not implemented')
  }
}
