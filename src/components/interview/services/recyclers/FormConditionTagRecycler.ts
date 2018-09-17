import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SurveyConditionTag from '../../../../entities/trellis/SurveyConditionTag'
import InterviewManagerOld from '../../classes/InterviewManager'

class FormConditionTagRecycler extends Recycler<SurveyConditionTag> {
  keyExtractor (tag: SurveyConditionTag) {
    return [
      tag.conditionId,
      tag.surveyId
    ].join('-')
  }
  objectCreator (interview: InterviewManagerOld, act: SurveyConditionTag) {
    return new SurveyConditionTag().fromRecycler({
      id: uuidv4(),
      surveyId: interview.interview.surveyId,
      conditionId: act.conditionTag.id,
      interviewId: interview.interview.id
    })
  }
}

export default new FormConditionTagRecycler()
