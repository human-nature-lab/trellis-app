import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import Datum from '../../../../entities/trellis/Datum'
import {snakeToCamel} from '../../../../services/JSONUtil'

const keyNames = ['name', 'questionDatumId', 'surveyId', 'choiceId', 'edgeId', 'geoId', 'photoId', 'rosterId']
class DatumRecycler extends Recycler<Datum> {
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
      let camel = snakeToCamel(key)
      datum[camel] = payload[key]
    }
    return datum
  }
}

export default new DatumRecycler()
