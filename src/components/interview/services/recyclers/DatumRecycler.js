import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
import moment from 'moment'

const keyNames = ['name', 'question_datum_id', 'survey_id', 'choice_id', 'edge_id', 'geo_id', 'photo_id', 'roster_id']
class DatumRecycler extends Recycler {
  keyExtractor (datum) {
    // The unique key of a datum is everything except for the id. This means that previously deleted datum could be
    // recreated if it has already been deleted from the server, but it also means that quick changes to datum that end
    // up with the same result don't send changes to the server
    return keyNames.map(key => datum[key]).join('-')
  }
  objectCreator (questionDatum, payload) {
    let maxEventOrder = -1
    for (let datum of questionDatum.data) {
      if (datum.event_order > maxEventOrder) {
        maxEventOrder = datum.event_order
      }
    }
    let datum = {
      id: uuidv4(),
      name: questionDatum.var_name,
      question_datum_id: questionDatum.id,
      event_order: maxEventOrder + 1,
      datum_type_id: '0',
      updated_at: moment().format(),
      created_at: moment().format()
    }
    for (let key in payload) {
      datum[key] = payload[key]
    }
    return datum
  }
}

export default new DatumRecycler()
