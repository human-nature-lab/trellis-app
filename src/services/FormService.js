import http from './AxiosInstance'
export default class FormService {
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
}
