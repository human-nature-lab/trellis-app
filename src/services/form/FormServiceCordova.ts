import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import Form from '../../entities/trellis/Form'
import StudyForm from "../../entities/trellis/StudyForm";

export default class FormServiceCordova implements FormServiceInterface {

  async getRepo () {
    return await DatabaseService.getRepository(Form)
  }

  async getStudyForms (studyId: string) {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      studyId,
      deletedAt: null
    })
    return studyForms
  }

  async getForm (id: string) {
    const repo = await this.getRepo()
    let form = await repo.findOne({id})
    debugger
    return form
  }

}
