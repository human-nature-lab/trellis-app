import Interview from "../../entities/trellis/Interview";
import Action from "../../entities/trellis/Action";
import InterviewDeltaInterface from "./InterviewDeltaInterface";
import InterviewDataInterface from "./InterviewDataInterface";

export default interface InterviewServiceInterface {
  /**
   * Get a single interview instance by id
   */
  getInterview (interview: string): Promise<Interview>

  /**
   * Get all existing actions for this interview
   * @param {string} interviewId
   * @returns {Promise<Action[]>}
   */
  getActions (interviewId: string): Promise<Action[]>

  /**
   * Save an array of actions in the database
   * @param {string} interviewId
   * @param {Action[]} actions
   * @returns {Promise<Action[]>}
   */
  saveActions (interviewId: string, actions: Action[]): Promise<void>

  /**
   * Resolve to the existing data which defines the state of the survey.
   */
  getData (interviewId: string): Promise<InterviewDataInterface>

  /**
   * Store an InterviewDataDelta object in the database
   * @param {string} interviewId
   * @param {InterviewDeltaInterface} diff
   * @returns {Promise<any>}
   */
  saveData (interviewId: string, diff: InterviewDeltaInterface): Promise<any>

  /**
   * Not used
   * Resolves to any preload data
   */
  getPreload (interviewId: string): Promise<any[]>

  /**
   * Resolves when the survey has been marked as complete
   */
  complete (interviewId: string): Promise<void>

  /**
   * Resolves to the interview that has been created
   */
  create (surveyId: string): Promise<Interview>
}
