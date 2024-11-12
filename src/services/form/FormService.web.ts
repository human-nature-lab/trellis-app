import { saveAs } from 'file-saver'
import http, { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import FormServiceInterface from './FormServiceInterface'
import StudyForm from '@/entities/trellis/StudyForm'
import Form from '@/entities/trellis/Form'
import formTypes from '@/static/form.types'

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

  getForm (formId: string): Promise<Form> {
    return http().get(uriTemplate('form/{form}', [formId]))
      .then(res => {
        if (res.data.form) {
          const form = new Form().fromSnakeJSON(res.data.form)
          return form
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

  async createForm (studyId: string, formType: formTypes): Promise<StudyForm> {
    const res = await adminInst.post(uriTemplate('study/{study}/form', [studyId]), {
      form_type: formType,
    })
    return new StudyForm().fromSnakeJSON(res.data.form)
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
    const res = await adminInst.get(uriTemplate('form/{form}', [formId]))
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'text/json' })
    const t = res.data.form.name_translation
    const name = t && t.translation_text && t.translation_text.length && t.translation_text[0].translated_text
    const version = res.data.form.version
    saveAs(blob, `trellis-form-${name}-v${version}.json`)
  }

  async importForm (studyId: string, formName: string, formType: number, file: File): Promise<Form> {
    const formData = new FormData()
    formData.append('formJsonFile', file)
    formData.append('formName', formName)
    formData.append('formType', formType)
    const res = await adminInst.post(uriTemplate('study/{studyId}/form/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Form().fromSnakeJSON(res.data.importedForm)
  }

  async deleteForm (studyId: string, formId: string) {
    await adminInst.delete(uriTemplate('study/{study}/form/{form}', [studyId, formId]))
  }

  async reorderForms (studyId: string, studyForms: StudyForm[]): Promise<StudyForm[]> {
    const res = await adminInst.patch(uriTemplate('study/{study}/forms/reorder', [studyId]), { study_forms: studyForms })
    return res.data.forms.map(f => new StudyForm().fromSnakeJSON(f))
  }

  async publishForm (studyId: string, formId: string): Promise<object> {
    const res = await adminInst.post(
      uriTemplate('study/{study}/form/{form}/publish', [studyId, formId]),
      null,
      { timeout: 0 },
    )
    return res.data
  }

  async getVersions (formId: string): Promise<Form[]> {
    const res = await adminInst.get(uriTemplate('form/{form}/versions', [formId]))
    const versions = res.data.versions.map(f => new Form().fromSnakeJSON(f))
    versions.sort((a, b) => b.version - a.version)
    return versions
  }

  async revertVersion (formMasterId: string, formVersionId: string): Promise<StudyForm> {
    const res = await adminInst.put(uriTemplate('form/{form}/revert/{version}', [formMasterId, formVersionId]))
    return new StudyForm().fromSnakeJSON(res.data)
  }
}

export default FormServiceWeb
