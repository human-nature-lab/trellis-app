import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SurveyConditionTag from "../../../../entities/trellis/SurveyConditionTag";
import Interview from "../../../../entities/trellis/Interview";

class FormConditionTagRecycler extends Recycler<SurveyConditionTag> {
  /**
   * Takes the same object that objectCreator returns
   * @param tag
   * @returns {string}
   */
  keyExtractor (tag: SurveyConditionTag) {
    return [
      tag.conditionId,
      tag.surveyId
    ].join('-')
  }

  /**
   * Returns a new SurveyConditionTag instance
   * @param {Interview} interview
   * @param {SurveyConditionTag} act
   * @returns {SurveyConditionTag}
   */
  objectCreator (interview: Interview, act: SurveyConditionTag) {
    return new SurveyConditionTag().fromRecycler(uuidv4(), interview.surveyId, act.conditionTag.id, interview.id)
  }
}

export default new FormConditionTagRecycler()
