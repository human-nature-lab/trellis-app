import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import RespondentConditionTag from "../../../../entities/trellis/RespondentConditionTag";

const keyNames = ['respondent_id', 'condition_id']
class RespondentConditionTagRecycler extends Recycler<RespondentConditionTag> {
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
   * @param questionBlueprint
   * @returns {{id: *, section_repetition: number, follow_up_datum_id: number, section, page, survey_id: *, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   */
  objectCreator (interview, act) {
    let r = new RespondentConditionTag()
    r.id = uuidv4()
    r.respondentId = interview.survey.respondent_id
    r.createdAt = now()
    r.updatedAt = now()
    return r
  }
}

export default new RespondentConditionTagRecycler()
