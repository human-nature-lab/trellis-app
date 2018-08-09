import Recycler, {Recyclable} from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'

// const keyNames = ['survey_id', 'section_repetition', 'follow_up_datum_id', 'question_id']
const keyNames = ['surveyId', 'sectionRepetition', 'followUpDatumId', 'questionId']
class QuestionDatumRecycler extends Recycler<QuestionDatum> implements Recyclable<QuestionDatum> {
  /**
   * Takes the same object that objectCreator returns
   * @param qd
   * @returns {string}
   */
  keyExtractor (qd) {
    // The unique key of a single question datum
    return keyNames.map(key => qd[key] === null ? 'null' : qd[key]).join('-')
  }

  /**
   * Returns a questionDatum object
   * @param interview
   * @param questionBlueprint
   * @returns QuestionDatum
   */
  objectCreator (interview, questionBlueprint) {
    let qd = new QuestionDatum()
    qd.id = uuidv4()
    qd.sectionRepetition = interview.location.sectionRepetition
    qd.followUpDatumId = interview.location.sectionFollowUpDatumId
    qd.surveyId = interview.interview.survey_id
    qd.interviewId = interview.interview.id
    qd.questionId = questionBlueprint.id
    qd.dkRf = null
    qd.createdAt = now()
    qd.updatedAt = now()
    qd.deletedAt = null
    return qd
  }
}

export default new QuestionDatumRecycler()
