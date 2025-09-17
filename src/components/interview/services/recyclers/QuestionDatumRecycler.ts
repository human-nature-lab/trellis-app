import Recycler, { Recyclable } from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import { now } from '../../../../services/DateService'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import Question from '../../../../entities/trellis/Question'
import Interview from '../../../../entities/trellis/Interview'
import { InterviewLocation } from '../InterviewAlligator'

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
      qd.questionId,
    ]
  }

  /**
   * Returns a questionDatum object
   * @param {InterviewManagerOld} interview
   * @param {Question} questionBlueprint
   * @returns {QuestionDatum}
   */
  objectCreator (interview: Interview, location: InterviewLocation, questionBlueprint: Question): QuestionDatum {
    return new QuestionDatum().fromRecycler({
      id: uuidv4(),
      questionId: questionBlueprint.id,
      surveyId: interview.surveyId,
      followUpDatumId: location.sectionFollowUpDatumId,
      sectionRepetition: location.sectionRepetition,
      answeredAt: now(),
      skippedAt: null,
      interviewId: interview.id,
      dkRf: null,
      dkRfVal: null,
      noOne: null,
    })
  }
}

export default new QuestionDatumRecycler()
