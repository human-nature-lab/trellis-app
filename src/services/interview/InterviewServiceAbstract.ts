import Interview from '../../entities/trellis/Interview'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import InterviewDataInterface from './InterviewDataInterface'
import DiffService from "../DiffService";
import * as moment from "moment"

export default abstract class InterviewServiceAbstract {

  /**
   * Compute the difference between two interview states and persist the differences to the database.
   * @param interviewId
   * @param newState
   * @param prevState
   */
  saveDiff (interviewId: string, newState: InterviewDataInterface, prevState: InterviewDataInterface): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // Push the diff to the end of the event queue
      setTimeout(() => {
        let dataDiff = DiffService.dataDiff(newState.data, prevState.data)
        let tagDiff = DiffService.conditionTagsDiff(newState.conditionTags, prevState.conditionTags)
        let diff = new InterviewDeltaInterface(dataDiff, tagDiff)
        if (DiffService.hasChanges(diff)) {
          console.log('changes found', diff)
          // console.log('JSON diff', JSON.stringify(diff))
          resolve(this.saveData(interviewId, diff))
        } else {
          console.log('no changes found', diff)
          resolve()
        }
      })
    })
  }

  /**
   * Get a single interview instance by id
   */
  abstract getInterview (interview: string): Promise<Interview>

  /**
   * Get all existing actions for this interview
   * @param {string} interviewId
   * @returns {Promise<Action[]>}
   */
  abstract getActions (interviewId: string): Promise<Action[]>

  /**
   * Save an array of actions in the database
   * @param {string} interviewId
   * @param {Action[]} actions
   * @returns {Promise<Action[]>}
   */
  abstract saveActions (interviewId: string, actions: Action[]): Promise<void>

  /**
   * Resolve to the existing data which defines the state of the survey.
   */
  abstract getData (interviewId: string): Promise<InterviewDataInterface>

  /**
   * Store an InterviewDataDelta object in the database
   * @param {string} interviewId
   * @param {InterviewDeltaInterface} diff
   * @returns {Promise<any>}
   */
  abstract saveData (interviewId: string, diff: InterviewDeltaInterface): Promise<any>

  /**
   * Not used
   * Resolves to any preload data
   */
  abstract getPreload (interviewId: string): Promise<any[]>

  /**
   * Resolves when the survey has been marked as complete
   */
  abstract complete (interviewId: string): Promise<void>

  /**
   * Resolves to the interview that has been created
   */
  abstract create (surveyId: string, coordinates: Coordinates): Promise<Interview>

  /**
   * Returns the latest interview within the given tolerance if one exists.
   * @param tolerance
   */
  abstract getLatestInterviewPosition (respondentId: string, tolerance: number): Promise<null|Coordinates>

  /**
   * Convert a tolerance into a queriable date for the database
   * @param tolerance
   */
  protected getDateFromTolerance (tolerance: number): string {
    const now = moment().utc()
    return now.subtract(tolerance, 'ms').format('YYYY-MM-DD HH:mm:ss')
  }
}
