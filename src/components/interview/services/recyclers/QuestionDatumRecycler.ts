import Recycler, {Recyclable} from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import Question from '../../../../entities/trellis/Question'
import InterviewManagerOld from '../../classes/InterviewManager'

class QuestionDatumRecycler extends Recycler<QuestionDatum> implements Recyclable<QuestionDatum> {
  /**
   * @param {QuestionDatum} qd
   * @returns {string}
   */
  keyExtractor (qd: QuestionDatum): string {
    return [
      qd.surveyId,
      qd.sectionRepetition,
      qd.followUpDatumId,
      qd.questionId
    ].join('-')
  }

  /**
   * Returns a questionDatum object
   * @param {InterviewManagerOld} interview
   * @param {Question} questionBlueprint
   * @returns {QuestionDatum}
   */
  objectCreator (interview: InterviewManagerOld, questionBlueprint: Question): QuestionDatum {
    return new QuestionDatum().fromRecycler(
      uuidv4(),
      questionBlueprint.id,
      interview.interview.surveyId,
      interview.location.sectionFollowUpDatumId,
      interview.location.sectionRepetition,
      now(),
      now(),
      interview.interview.id,
    null,
    null,
    )
  }
}

export default new QuestionDatumRecycler()
