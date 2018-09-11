import Study from '../../entities/trellis/Study'
import SingletonService from '../SingletonService'

export default abstract class StudyServiceAbstract {
  /**
   * Get the currently selected study
   * @returns {Promise<Study>}
   */
  getCurrentStudy(): Study | null {
    const study = SingletonService.get('study')
    return (study instanceof Study) ? study : null
  }

  /**
   * Set the current study
   * @param {Study} study
   */
  setCurrentStudy(study: Study): void {
    SingletonService.setCurrentStudy(study)
  }

  /**
   * Get a study by the study id
   * @param {string} studyId
   * @returns {Promise<Study>}
   */
  abstract getStudy(studyId): Promise<Study>

  /**
   * Get all of the studies assigned to me
   * @returns {Promise<Study[]>}
   */
  abstract getMyStudies(): Promise<Study[]>

  /**
   * Get all studies assigned to a user
   * @param {string} userId
   * @returns {Promise<Study[]>}
   */
  abstract getUserStudies(userId: string): Promise<Study[]>
}

