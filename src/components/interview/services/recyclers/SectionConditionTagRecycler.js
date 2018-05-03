import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
class SectionConditionTagRecycler extends Recycler {
  /**
   * Takes the same object that objectCreator returns
   * @param qd
   * @returns {string}
   */
  keyExtractor (tag) {
    // The unique key of a single question datum
    return `${tag.scope}-${tag.survey_id}-${tag.condition_id}-${tag.repetition}-${tag.follow_up_datum_id}`
  }

  /**
   * Returns a questionDatum object
   * @param interview
   * @param questionBlueprint
   * @returns {{id: *, section_repetition: number, follow_up_datum_id: number, section, page, survey_id: *, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   */
  objectCreator (interview, act) {
    return {
      id: uuidv4(),
      survey_id: interview.interview.survey_id,
      condition_id: act.condition.id,
      repetition: interview.location.sectionRepetition,
      follow_up_datum_id: interview.location.sectionFollowUpDatumId,
      created_at: (new Date()).getTime(),
      updated_at: (new Date()).getTime()
    }
  }
}

export default new SectionConditionTagRecycler()
