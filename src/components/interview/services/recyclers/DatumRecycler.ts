import Recycler from '../../../../classes/Recycler'
import uuidv4 from 'uuid/v4'
import Datum from '../../../../entities/trellis/Datum'
import {snakeToCamel} from '../../../../services/JSONUtil'
import {now} from '../../../../services/DateService';
import QuestionDatum from "../../../../entities/trellis/QuestionDatum";

const keyNames = ['name', 'questionDatumId', 'surveyId', 'choiceId', 'edgeId', 'geoId', 'photoId', 'rosterId']
class DatumRecycler extends Recycler<Datum> {
  keyExtractor (datum: Datum) {
    // The unique key of a datum is everything except for the id. This means that previously deleted datum could be
    // recreated if it has already been deleted from the server, but it also means that quick changes to datum that end
    // up with the same result don't send changes to the server
    return keyNames.map(key => datum[key]).join('-')
  }
  objectCreator (questionDatum: QuestionDatum, payload: object) {
    let maxEventOrder = Math.max(0, ...questionDatum.data.map(d => d.eventOrder))
    let datum = new Datum()
    datum.id = uuidv4()
    datum.questionDatumId = questionDatum.id
    datum.eventOrder = maxEventOrder + 1
    datum.createdAt = now()
    datum.updatedAt = now()
    for (let key in payload) {
      let camel = snakeToCamel(key)
      datum[camel] = payload[key]
    }
    return datum
  }
}

export default new DatumRecycler()
