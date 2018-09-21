import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import {IsNull} from 'typeorm';
import {removeSoftDeleted} from "../database/SoftDeleteHelper";
import {isEqual} from 'lodash'

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      where: {
        studyId: studyId,
        censusTypeId: IsNull(),
        deletedAt: IsNull()
      },
      deletedAt: null
    })
    return studyForms.filter(s => s.form.isPublished)
  }

  async getForm (id: string, bareBones: boolean = false): Promise<Form> {
    console.log('getForm', id)
    const repo = await DatabaseService.getRepository(Form)

    // Questions relationship has been removed from
    const form = await repo.findOne({
      where: {
        id: id
      },
      relations: ['sections']
    })
    const groups: QuestionGroup[] = []
    const promises: Promise<boolean>[] = []
    form.sections.forEach(section => {
      section.questionGroups.forEach(qg => {
        groups.push(qg)
        promises.push(new Promise(async (resolve) => {
          const r = await DatabaseService.getRepository(Question)
          qg.questions = await r.find({
            where: {
              questionGroupId: qg.id,
              deletedAt: IsNull()
            }
          })
          resolve(true)
        }))
      })
    })
    await Promise.all(promises)
    removeSoftDeleted(form)
    return form
  }

}
