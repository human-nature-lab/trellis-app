import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SurveyConditionTag from "../../../../entities/trellis/SurveyConditionTag";
import InterviewManager from "../../classes/InterviewManager";

class FormConditionTagRecycler extends Recycler<SurveyConditionTag> {
  keyExtractor (tag: SurveyConditionTag) {
    return [
      tag.conditionId,
      tag.surveyId
    ].join('-')
  }
  objectCreator (interview: InterviewManager, act: SurveyConditionTag) {
    return new SurveyConditionTag().fromRecycler(uuidv4(), interview.interview.surveyId, act.conditionTag.id, interview.interview.id)
  }
}

export default new FormConditionTagRecycler()
