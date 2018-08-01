import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import {now} from '../../../../services/DateService'
import Datum from '../../../../entities/Datum'

const keyNames = ['name', 'question_datum_id', 'survey_id', 'choice_id', 'edge_id', 'geo_id', 'photo_id', 'roster_id']
class DatumRecycler extends Recycler {
  keyExtractor (datum) {
    // The unique key of a datum is everything except for the id. This means that previously deleted datum could be
    // recreated if it has already been deleted from the server, but it also means that quick changes to datum that end
    // up with the same result don't send changes to the server
    return keyNames.map(key => datum[key]).join('-')
  }
  objectCreator (questionDatum, payload) {
    let maxEventOrder = Math.max(...questionDatum.data.map(d => d.event_order))
    let datum = new Datum()
    datum.id = uuidv4()
    datum.questionDatumId = questionDatum.id
    datum.eventOrder = maxEventOrder + 1
    for (let key in payload) {
      datum[key] = payload[key]
    }
    return datum
  }
}

export default new DatumRecycler()
