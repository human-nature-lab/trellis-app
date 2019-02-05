import Study from '../../entities/trellis/Study'
import SingletonService from '../SingletonService'

export default abstract class StudyServiceAbstract {
  /**
   * Get the currently selected study
   * @returns {Promise<Study>}
   */
  getCurrentStudy(): Study | undefined {
    const study = SingletonService.get('study')
    return (study instanceof Study) ? study : undefined
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
  abstract getStudy(studyId): PromiseLike<Study|undefined>

  /**
   * Get all of the studies assigned to me
   * @returns {PromiseLike<Study[]>}
   */
  abstract getMyStudies(): PromiseLike<Study[]>

  /**
   * Get all studies assigned to a user
   * @param {string} userId
   * @returns {PromiseLike<Study[]>}
   */
  abstract getUserStudies(userId: string): PromiseLike<Study[]>

  /**
   * Get all studies
   */
  abstract getAllStudies (): PromiseLike<Study[]>
}

