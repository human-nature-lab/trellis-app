import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import {In, IsNull} from 'typeorm'
import {removeSoftDeleted} from "../database/SoftDeleteHelper";
import {isEqual} from 'lodash'
import Section from '../../entities/trellis/Section'
import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      where: {
        studyId: studyId,
        censusTypeId: IsNull(),
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

    return form
  }

}
