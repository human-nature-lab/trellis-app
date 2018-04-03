import http from '@/services/http/AxiosInstance'
import storage from '@/services/storage/StorageService'
export default class DataService {
  static getLocales () {
    let studyId = storage.get('studyId', 'string')
    return http().get(`study/${studyId}/locales`)
      .then(response => {
        return response.data.locales
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  static getForm (formId) {
    return http().get(`form/${formId}/structure`)
      .then(function (response) {
        return response.data
      })
      .catch(function (err) {
        console.log('error', err)
        throw err
      })
  }
  static getConditions (respondentId, formId, sectionId) {
    return Promise.all([
      http().get(`conditions/respondent/${respondentId}`),
      http().get(`conditions/form/${formId}`),
      http().get(`conditions/section/${sectionId}`)
    ])
      .then(function (conditions) {
        let {respondentConditions, formConditions, sectionConditions} = conditions
        respondentConditions = respondentConditions.forEach(c => { c.type = 'respondent' })
        formConditions = formConditions.forEach(c => { c.type = 'form' })
        sectionConditions = sectionConditions.forEach(c => { c.type = 'section' })
        return respondentConditions.concat(formConditions.concat(sectionConditions))
      })
      .catch(function (err) {
        console.error(err)
        throw err
      })
  }
  static getActionTypes (formId) {
    return http().get('form/action-types')
      .then(function (response) {
        return response.data
      })
      .catch(function (err) {
        console.log('error', err)
        throw err
      })
  }
}
