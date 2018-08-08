import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import SectionConditionTag from "../../../../entities/trellis/SectionConditionTag";

const keyNames = ['scope', 'survey_id', 'condition_id', 'repetition', 'follow_up_datum_id']
class SectionConditionTagRecycler extends Recycler<SectionConditionTag> {
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
    let s = new SectionConditionTag()
    s.id = uuidv4()
    s.surveyId = interview.interview.survey_id
    s.conditionId = act.condition.id
    s.repetition = interview.location.sectionRepetition
    s.followUpDatumId = interview.location.sectionFollowUpDatumId
    s.createdAt = now()
    s.updatedAt = now()
    return s
  }
}

export default new SectionConditionTagRecycler()
