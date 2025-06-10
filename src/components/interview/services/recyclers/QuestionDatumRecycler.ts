import Recycler, {Recyclable} from '../../../../classes/Recycler'
import { v4 as uuidv4 } from 'uuid'
import { now } from '../../../../services/DateService'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import Question from '../../../../entities/trellis/Question'
import InterviewManagerOld from '../../classes/InterviewManager'

class QuestionDatumRecycler extends Recycler<QuestionDatum> implements Recyclable<QuestionDatum> {
  /**
   * @param {QuestionDatum} qd
   * @returns {string}
   */
  keyExtractor (qd: QuestionDatum) {
    return [
      qd.surveyId,
      qd.sectionRepetition,
      qd.followUpDatumId,
      qd.questionId
    ]
  }

  /**
   * Returns a questionDatum object
   * @param {InterviewManagerOld} interview
   * @param {Question} questionBlueprint
   * @returns {QuestionDatum}
   */
  objectCreator (interview: InterviewManagerOld, questionBlueprint: Question): QuestionDatum {
    return new QuestionDatum().fromRecycler({
      id: uuidv4(),
      questionId: questionBlueprint.id,
      surveyId: interview.interview.surveyId,
      followUpDatumId: interview.location.sectionFollowUpDatumId,
      sectionRepetition: interview.location.sectionRepetition,
      answeredAt: now(),
      skippedAt: null,
      interviewId: interview.interview.id,
      dkRf: null,
      dkRfVal: null
    })
  }
}

export default new QuestionDatumRecycler()
