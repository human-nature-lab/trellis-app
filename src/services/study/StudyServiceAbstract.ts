import Study from '../../entities/trellis/Study'
import storage from '../storage/StorageService'
import singleton from '../../static/singleton'

export default abstract class StudyService {
  /**
   * Get the currently selected study
   * @returns {Promise<Study>}
   */
  getCurrentStudy (): Promise<Study> {
    return new Promise((resolve, reject) => {
      if (storage.get('current-study', 'object')) {
        return resolve(storage.get('current-study', 'object'))
      } else {
        return reject()
      }
    })
  }

  /**
   * Apply the existing version of the study to the global Vue data store
   */
  setExistingStudy (): void {
    if (storage.get('current-study')) {
      singleton.study = storage.get('current-study')
    }
  }

  /**
   * Set the current study
   * @param {Study} study
   */
  setCurrentStudy (study: Study): void {
    storage.set('current-study', study)
    singleton.study = study
  }

  /**
   * Get a study by the study id
   * @param {string} studyId
   * @returns {Promise<Study>}
   */
  abstract getStudy (studyId): Promise<Study>

  /**
   * Get all of the studies assigned to me
   * @returns {Promise<Study[]>}
   */
  abstract getMyStudies (): Promise<Study[]>
}
