import formTypes from '../../static/form.types'
import http, { adminInst } from '../http/AxiosInstance'
import FormServiceInterface from './FormServiceInterface'
import StudyForm from '../../entities/trellis/StudyForm'
import { saveAs } from 'file-saver'
import Form from '../../entities/trellis/Form'
import { uriTemplate } from '../http/WebUtils'
export class FormServiceWeb implements FormServiceInterface {

  getStudyForms (studyId: string): Promise<StudyForm[]> {
    return http().get(uriTemplate('study/{study}/forms/published', [studyId])).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => new StudyForm().fromSnakeJSON(form))
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  async getAllStudyForms (studyId: string): Promise<StudyForm[]> {
    const res = await adminInst.get(uriTemplate('study/{}/form', [studyId]))
    return res.data.forms.map(f => new StudyForm().fromSnakeJSON(f))
  }

  getForm (formId: string, bareBones: boolean = false): Promise<Form> {
    return http().get(uriTemplate('form/{form}', [formId]))
      .then(res => {
        if (res.data.form) {
          return new Form().fromSnakeJSON(res.data.form)
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

  async createForm (studyId: string, formType: formTypes): Promise<Form> {
    const res = await adminInst.post(uriTemplate('study/{study}/form', [studyId]), {
      form_type: formType
    })
    return new Form().fromSnakeJSON(res.data.form)
  }

  async updateForm (form: Form): Promise<Form> {
    const res = await adminInst.put(uriTemplate('form/{form_id}', [form.id]), form.toSnakeJSON())
    return new Form().fromSnakeJSON(res.data.form)
  }

  async updateStudyForm (studyId: string, studyForm: StudyForm): Promise<StudyForm> {
    const res = await adminInst.put(uriTemplate('study/{}/form/{}', [studyId, studyForm.form.id]), studyForm.toSnakeJSON())
    return new StudyForm().fromSnakeJSON(res.data.study_form)
  }

  async exportForm (formId: string) {
    const res = await http().get(uriTemplate('form/{form}', [formId]))
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'text/json' })
    saveAs(blob, `form-${formId}.json`)
  }

  async deleteForm (studyId: string,formId: string) {
    await adminInst.delete(uriTemplate('study/{study}/form/{form}', [studyId, formId]))
  }

}

export default FormServiceWeb
