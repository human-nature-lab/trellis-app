import ConditionTag from '../../entities/trellis/ConditionTag'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'

export default interface ConditionTagInterface {
  /**
   * Creates a new condition tag
   * @param name
   */
  createConditionTag (name: string): Promise<ConditionTag>

  /**
   * Create a respondent condition tag with the supplied id
   * @param {String} respondentId
   * @param {String} conditionTagId
   * @returns {Promise<Object>}
   */
  createRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<RespondentConditionTag>

  /**
   * Removes a respondent condition tag
   * @param {String} respondentId
   * @param {String} conditionTagId
   * @returns {*}
   */
  removeRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<void>

  /**
   * Get all of the available condition tags
   * @returns {Array} - An array of condition tags
   */
  respondent (): Promise<ConditionTag[]>

  /**
   * Get all condition tags
   * @returns {Promise<Object[]>}
   */
  all (): Promise<ConditionTag[]>
}
