import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
import moment from 'moment'

const keyNames = ['scope', 'survey_id', 'condition_id']
class FormConditionTagRecycler extends Recycler {
  /**
   * Takes the same object that objectCreator returns
   * @param tag
   * @returns {string}
   */
  keyExtractor (tag) {
    return keyNames.map(key => tag[key]).join('-')
  }

  /**
   * Returns a questionDatum object
   * @param interview
   * @param act
   * @returns {{id: *, section_repetition: number, follow_up_datum_id: number, section, page, survey_id: *, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   */
  objectCreator (interview, act) {
    return {
      id: uuidv4(),
      survey_id: interview.survey_id,
      condition_id: act.condition.id,
      created_at: moment().format(),
      updated_at: moment().format()
    }
  }
}

export default new FormConditionTagRecycler()
