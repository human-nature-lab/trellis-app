import http from '@/services/http/AxiosInstance'
export default class FormService {
  /**
   * Gets all forms for the current study
   * @param {String} studyId
   * @returns {Promise<Array>}
   */
  static getStudyForms (studyId) {
    return http().get(`study/${studyId}/form`)
      .then(res => {
        if (res.data.forms) {
          return res.data.forms.map(form => {
            form.sort_order = form.pivot.sort_order
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
  static getForm (formId) {
    return http().get(`form/${formId}`)
      .then(res => {
        if (res.data.form) {
          return res.data.form
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }
}
