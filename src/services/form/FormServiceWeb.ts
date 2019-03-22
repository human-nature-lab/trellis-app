import http from '../http/AxiosInstance'
import {adminInst} from '../http/AxiosInstance'
import FormServiceInterface from './FormServiceInterface'
import StudyForm from '../../entities/trellis/StudyForm'
import {saveAs} from 'file-saver'
import Form from '../../entities/trellis/Form'
import {safeUrl} from "../http/WebUtils";
export class FormServiceWeb implements FormServiceInterface {

  getStudyForms (studyId: string): Promise<StudyForm[]> {
    return http().get(safeUrl('study/{study}/forms/published', [studyId])).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => new StudyForm().fromSnakeJSON(form))
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  getForm (formId: string, bareBones: boolean = false): Promise<Form> {
    return http().get(safeUrl('form/{form}', [formId]))
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
    const res = await adminInst.post(safeUrl('study/{study}/form', [studyId]), {
      form: form
    })
    return new Form().fromSnakeJSON(res.data.form)
  }

  async updateForm (studyId: string, form: Form): Promise<Form> {
    const res = await adminInst.put(safeUrl('study/{study_id}/form/{form_id}', [studyId, form.id]))
    return new Form().fromSnakeJSON(res.data.form)
  }

  async exportForm (formId: string) {
    const form = await this.getForm(formId)
    const blob = new Blob([JSON.stringify(form.toSnakeJSON({includeRelationships: true}), null, 2)], { type: 'text/json' })
    saveAs(blob, `form-${formId}.json`)
  }

  async deleteForm (studyId: string,formId: string) {
    await adminInst.delete(safeUrl('study/{study}/form/{form}', [studyId, formId]))
  }

}

export default FormServiceWeb
