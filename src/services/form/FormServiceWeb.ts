import http from '../http/AxiosInstance'
import {adminInst} from '../http/AxiosInstance'
import FormServiceInterface from './FormServiceInterface'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
export class FormServiceWeb implements FormServiceInterface {

  getStudyForms (studyId: string): Promise<StudyForm[]> {
    return http().get(`study/${studyId}/forms/published`).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => new StudyForm().fromSnakeJSON(form))
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  getForm (formId: string, bareBones: boolean = false): Promise<Form> {
    return http().get(`form/${formId}`)
      .then(res => {
        if (res.data.form) {
          // let form = new Form().fromSnakeJSON(res.data.form)
          // console.log(form)
          return new Form().fromSnakeJSON(res.data.form)
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

  async createForm (studyId: string, form: Form): Promise<Form> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.post(`study/${studyId}/form`, {
      form: form
    })
    return new Form().fromSnakeJSON(res.data.form)
  }

  async updateForm (studyId: string, formId: string, form: Form): Promise<Form> {
    throw Error('Not implemented')
  }

}

export default FormServiceWeb
