import http from '../http/AxiosInstance'
import formTypes from '../../static/form.types'
import FormServiceInterface from "./FormServiceInterface";
export class FormServiceWeb implements FormServiceInterface {

  /**
   * Gets all forms for the current study
   * @param {String} studyId
   * @returns {Promise<Array>}
   */
  getStudyForms (studyId: string) {
    return http().get(`study/${studyId}/forms/published`, {
      params: {
        form_type_id: formTypes.data_collection_form
      }
    }).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => {
          form.sort_order = form.study_form[0].sort_order
          return form
        })
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  /**
   * Gets a single form by id
   * @param {String} formId
   * @returns {Promise<Object>}
   */
  getForm (formId: string) {
    return http().get(`form/${formId}`)
      .then(res => {
        if (res.data.form) {
          // let form = new Form().fromJSON(res.data.form)
          // console.log(form)
          return res.data.form
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

}

export default new FormServiceWeb()
