import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SectionConditionTag from '../../../../entities/trellis/SectionConditionTag'
import AssignConditionTag from '../../../../entities/trellis/AssignConditionTag'
import InterviewManagerOld from '../../classes/InterviewManager'

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
   * @param {InterviewManagerOld} interview
   * @param {AssignConditionTag} act
   * @returns {SectionConditionTag}
   */
  objectCreator (interview: InterviewManagerOld, act: AssignConditionTag) {
    return new SectionConditionTag().fromRecycler({
        id: uuidv4(),
        sectionId: interview.location.sectionId,
        conditionId: act.conditionTagId,
        repetition: interview.location.sectionRepetition,
        followUpDatumId: interview.location.sectionFollowUpDatumId,
        interviewId: interview.interview.id,
        surveyId: interview.interview.surveyId
    })
  }
}

export default new SectionConditionTagRecycler()
