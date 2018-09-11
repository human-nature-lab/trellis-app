import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import RespondentConditionTag from '../../../../entities/trellis/RespondentConditionTag'
import AssignConditionTag from '../../../../entities/trellis/AssignConditionTag'
import InterviewManager from '../../classes/InterviewManager'
import Interview from '../../../../entities/trellis/Interview'

class RespondentConditionTagRecycler extends Recycler<RespondentConditionTag> {
  /**
   * Returns the unique key for this object
   * @param {RespondentConditionTag} tag
   * @returns {string}
   */
  keyExtractor (tag: RespondentConditionTag): string {
    return [
      tag.respondentId,
      tag.conditionTagId
    ].join('-')
  }

  /**
   * Get a new RespondentConditionTag
   * @param {Interview} interview
   * @param {AssignConditionTag} act
   * @returns {RespondentConditionTag}
   */
  objectCreator (interview: Interview, act: AssignConditionTag): RespondentConditionTag {
    return new RespondentConditionTag().fromRecycler(uuidv4(), interview.survey.respondentId, act.conditionTagId)
  }
}

export default new RespondentConditionTagRecycler()
