import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
class QuestionDatumRecycler extends Recycler {
  /**
   * Takes the same object that objectCreator returns
   * @param qd
   * @returns {string}
   */
  keyExtractor (qd) {
    // The unique key of a single question datum
    return `${qd.survey_id}-${qd.section}-${qd.section_repetition}-${qd.follow_up_datum_id}-${qd.page}-${qd.question_id}`
  }

  /**
   * Returns a questionDatum object
   * @param interview
   * @param questionBlueprint
   * @returns {{id: *, section_repetition: number, follow_up_datum_id: number, section, page, survey_id: *, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   */
  objectCreator (interview, questionBlueprint) {
    return {
      id: uuidv4(),
      section_repetition: interview.location.sectionRepetition,
      follow_up_datum_id: interview.location.sectionFollowUpDatumId,
      section: interview.location.section,
      page: interview.location.page,
      survey_id: interview.interview.survey_id,
      question_id: questionBlueprint.id,
      dk_rf: null,
      dk_rf_val: null,
      var_name: questionBlueprint.var_name,
      data: []
    }
  }
}

export default new QuestionDatumRecycler()
