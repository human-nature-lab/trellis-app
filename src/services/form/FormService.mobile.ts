import formTypes from '../../static/form.types'
import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import { In, IsNull, Not } from 'typeorm'
import { removeSoftDeleted } from '../database/SoftDeleteHelper'
import Section from '../../entities/trellis/Section'
import { namedQuery } from '../database/named'

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

  async getForm (id: string): Promise<Form> {
    console.log('getForm', id)
    const connection = await DatabaseService.getDatabase()
    const formRepository = connection.getRepository(Form)

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

  async formHasQuestionsWithParameters (formId: string, parameterIds: string[]): Promise<boolean> {
    const connection = await DatabaseService.getDatabase()
    const q = `select count(*) as c from question q
      where q.question_group_id in (
        select question_group_id from section_question_group sqg
        where sqg.section_id in (
          select section_id from form_section fs
          where fs.form_id = :formId 
          and fs.deleted_at is null
        ) and sqg.deleted_at is null
      ) 
      and q.deleted_at is null
      and q.id in (
        select question_id from question_parameter qp
        where qp.parameter_id in (:parameterIds)
        and qp.deleted_at is null
      )
    `
    const { query, params } = namedQuery(q, { parameterIds: parameterIds.map(pId => '' + pId), formId })
    console.log('transformed query', query, params)
    const res = await connection.query(query, params)
    console.log('result', res)
    return res[0].c === parameterIds.length
  }

  createForm (studyId: string, formType: formTypes): Promise<StudyForm> {
    throw Error('Not implemented' + studyId + formType)
  }

  updateForm (form: Form): Promise<Form> {
    throw Error('Not implemented:' + form)
  }

  async updateStudyForm (studyId: string, studyForm: StudyForm): Promise<StudyForm> {
    throw Error('Not implemented: ' + studyId + studyForm)
  }

  exportForm (formId: string): Promise<any> {
    throw Error('Not implemented:' + formId)
  }

  deleteForm (studyId: string, formId: string): Promise<any> {
    throw Error('Not implemented:' + studyId + formId)
  }

  reorderForms (studyId: string, studyForms: StudyForm[]): Promise<StudyForm[]> {
    throw new Error('Not implemented:' + studyId + studyForms)
  }

  getVersions (formId: string): PromiseLike<Form[]> {
    throw new Error('Method not implemented:' + formId)
  }

  revertVersion (formMasterId: string, formVersionId: string): PromiseLike<StudyForm> {
    throw new Error('Method not implemented:' + formMasterId + formVersionId)
  }
}
