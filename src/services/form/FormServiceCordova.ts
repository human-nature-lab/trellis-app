import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import {In, IsNull} from 'typeorm'
import {removeSoftDeleted} from "../database/SoftDeleteHelper";
import {isEqual} from 'lodash'

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      where: {
        studyId: studyId,
        deletedAt: IsNull()
      }
    })
    return studyForms.filter(s => (s.form.isPublished && s.form.deletedAt === null))
  }

  async getForm (id: string, bareBones: boolean = false): Promise<Form> {
    console.log('getForm', id)
    const connection = await DatabaseService.getDatabase()
    const formRepository = await connection.getRepository(Form)

    const form = await formRepository.findOne({
      where: {
        id: id
      },
      relations: ['sections']
    })

    const questionGroupMap = {}
    const questionGroupIds = []
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
        deletedAt: IsNull()
      }
    })

    questions.forEach((question) => {
      const questionGroup = questionGroupMap[question.questionGroupId]
      questionGroup.questions.push(question)
    })

    console.log('finished form', form)

    removeSoftDeleted(form)

    return form
  }

  createForm (studyId: string, form: Form): Promise<Form> {
    throw Error('Not implemented')
  }

  updateForm (studyId: string, form: Form): Promise<Form> {
    throw Error('Not implemented')
  }

  exportForm (formId: string): Promise<any> {
    throw Error('Not implemented')
  }

  deleteForm (studyId: string, formId: string): Promise<any> {
    throw Error('Not implemented')
  }

}
