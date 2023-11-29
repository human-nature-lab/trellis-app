import ConditionTag from '../../entities/trellis/ConditionTag'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'

export default interface ConditionTagInterface {

  // Get all of the available condition tags
  getRespondentConditionTagNames (): Promise<string[]>

  // Creates a new condition tag
  createConditionTag (name: string): Promise<ConditionTag>

  // Create a respondent condition tag with the supplied id
  createRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<RespondentConditionTag>

  // Removes a respondent condition tag
  removeRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<void>

  // Get all of the available condition tags
  respondent (): Promise<ConditionTag[]>

  // Get all condition tags
  all (): Promise<ConditionTag[]>

  // Import a CSV of respondent condition tags
  importRespondentConditionTags (file: File, studyId: string): Promise<any>
}
