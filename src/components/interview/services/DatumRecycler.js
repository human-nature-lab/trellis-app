import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
class DatumRecycler extends Recycler {
  objectCreator (questionDatum, payload) {
    let datum = {
      id: uuidv4(),
      question_datum_id: questionDatum.id
    }
    for (let key in payload) {
      datum[key] = payload[key]
    }
    return datum
  }
}

export default new DatumRecycler()
