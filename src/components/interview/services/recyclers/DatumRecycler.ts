import Recycler from '../../../../classes/Recycler'
import Datum from '../../../../entities/trellis/Datum'
import {now} from '../../../../services/DateService';
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'

export interface DatumPayload {
  name?: string
  val?: string
  sort_order?: number
  choice_id?: string
  geo_id?: string
  edge_id?: string
  photo_id?: string
  roster_id?: string
}

class DatumRecycler extends Recycler<Datum> {
  keyExtractor (d: Datum) {
    // The unique key of a datum is everything except for the id. This means that previously deleted datum could be
    // recreated if it has already been deleted from the server, but it also means that quick changes to datum that end
    // up with the same result don't send changes to the server
    return [
      d.name,
      d.questionDatumId,
      d.surveyId,
      d.choiceId,
      d.edgeId,
      d.geoId,
      d.photoId,
      d.rosterId
    ].join('-')
  }
  objectCreator (questionDatum: QuestionDatum, payload: DatumPayload) {
    let maxEventOrder = Math.max(-1, ...questionDatum.data.map(d => d.eventOrder))
    return new Datum().fromRecycler(
      questionDatum.surveyId,
      questionDatum.id,
      maxEventOrder + 1,
      payload.val,
      payload.sort_order,
      payload.name,
      payload.edge_id,
      payload.geo_id,
      payload.photo_id,
      payload.roster_id
    )
  }
}

export default new DatumRecycler()
