import http from '../http/AxiosInstance'
import {adminInst} from '../http/AxiosInstance'
import FormServiceInterface from './FormServiceInterface'
import StudyForm from '../../entities/trellis/StudyForm'
import {saveAs} from 'file-saver'
import Form from '../../entities/trellis/Form'
import {joinURIEncode} from "../http/WebUtils";
export class FormServiceWeb implements FormServiceInterface {

  getStudyForms (studyId: string): Promise<StudyForm[]> {
    return http().get(joinURIEncode('study', studyId, 'forms/published')).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => new StudyForm().fromSnakeJSON(form))
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  getForm (formId: string, bareBones: boolean = false): Promise<Form> {
    return http().get(joinURIEncode('form', formId))
      .then(res => {
        if (res.data.form) {
          return new Form().fromSnakeJSON(res.data.form)
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

  async createForm (studyId: string, form: Form): Promise<Form> {
    const res = await adminInst.post(joinURIEncode('study', studyId, 'form'), {
      form: form
    })
    return new Form().fromSnakeJSON(res.data.form)
  }

  async updateForm (studyId: string, formId: string, form: Form): Promise<Form> {
    throw Error('Not implemented')
  }

  async exportForm (formId: string) {
    const form = await this.getForm(formId)
    const blob = new Blob([JSON.stringify(form.toSnakeJSON({includeRelationships: true}), null, 2)], { type: 'text/json' })
    saveAs(blob, `form-${formId}.json`)
  }

  async deleteForm (studyId: string,formId: string) {
    await adminInst.delete(joinURIEncode('study', studyId, 'form', formId))
  }

}

export default FormServiceWeb
