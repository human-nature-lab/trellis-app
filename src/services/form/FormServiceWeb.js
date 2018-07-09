import http from '@/services/http/AxiosInstance'
export default class FormServiceWeb {
  /**
   * Gets all forms for the current study
   * @param {String} studyId
   * @returns {Promise<Array>}
   */
  static getStudyForms (studyId) {
    return http().get(`study/${studyId}/forms/published`)
      .then(res => {
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

  /**
   * Get the census form of the specified study if there is one
   * @param studyId
   * @param censusTypeId
   * @returns {*}
   */
  static getCensusForm (studyId, censusTypeId) {
    return http().get(`study/${studyId}/form/census`, {
      params: {
        census_type: censusTypeId
      }
    }).then(res => res.data.form)
  }

  /**
   * Check if the study has a census form for the given type
   * @param studyId
   * @param censusTypeId
   * @returns {*}
   */
  static hasCensusForm (studyId, censusTypeId) {
    return FormServiceWeb.getCensusForm(studyId, censusTypeId)
      .then(form => form ? true : false) // eslint-disable-line
  }

}
