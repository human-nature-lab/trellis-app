import Recycler from '@/classes/Recycler'
import uuidv4 from 'uuid/v4'
class DatumRecycler extends Recycler {
  keyExtractor (datum) {
    // The unique key of a datum is everything except for the id. This means that previously deleted datum could be
    // recreated if it has already been deleted from the server, but it also means that quick changes to datum that end
    // up with the same result don't send changes to the server
    return Object.keys(datum).filter(key => key !== 'id').map(key => datum[key]).join('-')
  }
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
