import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from "../../entities/trellis/StudyForm";
import Form from "../../entities/trellis/Form";

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      studyId,
      deletedAt: null
    })
    return studyForms
  }

  async getForm (id: string): Promise<Form> {
    console.log('getForm', id)
    const connection = await DatabaseService.getDatabase()
    console.log('connection foo', connection)
    //connection.createQueryBuilder
    return new Form()
    /*
    const repo = await DatabaseService.getRepository(Form)
    const form = await repo.findOne({
      id,
      relations: ['sections']
    })
    debugger
    return form
    */
  }

}
