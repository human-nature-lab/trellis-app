import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SectionConditionTag from "../../../../entities/trellis/SectionConditionTag";
import AssignConditionTag from "../../../../entities/trellis/AssignConditionTag";
import InterviewManager from "../../classes/InterviewManager";

class SectionConditionTagRecycler extends Recycler<SectionConditionTag> {
  /**
   * Returns the unique identifier for this condition tag
   * @param {SectionConditionTag} tag
   * @returns {any}
   */
  keyExtractor (tag: SectionConditionTag) {
    return [
      tag.surveyId,
      tag.conditionId,
      tag.repetition,
      tag.followUpDatumId
    ].join('-')
  }

  /**
   * Returns a new instance of SectionConditionTag
   * @param {InterviewManager} interview
   * @param {AssignConditionTag} act
   * @returns {SectionConditionTag}
   */
  objectCreator (interview: InterviewManager, act: AssignConditionTag) {
    return new SectionConditionTag().fromRecycler(
      uuidv4(),
      interview.location.sectionId,
      act.conditionTagId,
      interview.location.sectionRepetition,
      interview.location.sectionFollowUpDatumId,
      interview.interview.id,
      interview.interview.surveyId
    )
  }
}

export default new SectionConditionTagRecycler()
