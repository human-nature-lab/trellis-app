import storage from '../storage/StorageService'
import http from '../http/AxiosInstance'
export default class StudyService {
  static getCurrentStudy () {
    return new Promise((resolve, reject) => {
      if (storage.get('current-study', 'object')) {
        return resolve(storage.get('current-study', 'object'))
      } else {
        return reject()
      }
    })
  }
  /**
   * Get a study by the study id
   * @param studyId
   * @returns {Promise<any>}
   */
  static getStudy (studyId) {
    return http().get(`study/${studyId}`)
      .then(res => {
        if (res.status >= 200 && res.status < 400) {
          return res.data.study
        } else {
          throw Error('Unable to retrieve study with id: ' + studyId)
        }
      })
  }

  /**
   * Set the current study
   * @param study
   */
  static setCurrentStudy (study) {
    storage.set('current-study', study)
  }
}
