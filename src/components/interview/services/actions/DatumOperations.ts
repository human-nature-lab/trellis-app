import {snakeToCamel} from "../../../../services/JSONUtil";
import QuestionDatum from "../../../../entities/trellis/QuestionDatum";
import DatumRecycler from "../recyclers/DatumRecycler";
import Datum from "../../../../entities/trellis/Datum";

interface DatumFindFunc {
  (value: Datum, payload: any): boolean
}

/**
 * Update a datum with whatever is in the action payload
 * @param {Function} findFunc
 * @param {string} [name]
 * @returns {Function<Datum>}
 */
export function updateDatum (findFunc: DatumFindFunc, name?: string) {
  return function (interview, payload, questionDatum) {
    let datum = questionDatum.data.find(d => {
      return findFunc(d, payload)
    })
    if (datum) {
      for (let key in payload) {
        datum[key] = payload[key]
      }
    } else {
      let msg = 'No datum exists that matches this find closure.'
      if (name) msg += `Found in ${name}`
      throw new Error(msg)
    }
    return datum
  }
}

/**
 * Remove a single datum from the questionDatum.data array using the find closure supplied
 * @param {Function} findFunc - A closure which should identify the correct datum to remove
 * @returns {Function}
 */
export function removeDatum (findFunc: DatumFindFunc, name?: string) {
  return function (interview: object, payload: object, questionDatum: QuestionDatum) {
    let index = questionDatum.data.findIndex(datum => {
      return findFunc(datum, payload)
    })
    if (index > -1) {
      return questionDatum.data.splice(index, 1)[0]
    } else {
      let msg = 'No datum exists that matches this find closure.'
      if (name) msg += `Found in ${name}`
      throw new Error(msg)
    }
  }
}

/**
 * If the datum exists it will be updated with all values in the payload. If there isn't a datum, one will be created.
 * @param {Object} interview
 * @param {Object} payload
 * @param {Object} questionDatum
 * @returns {Datum}
 */
export function addOrUpdateSingleDatum (interview: object, payload: object, questionDatum: QuestionDatum) {
  let datum
  if (questionDatum.data.length) {
    datum = questionDatum.data[0]
    for (let key in payload) {
      let camel = snakeToCamel(key)
      datum[camel] = payload[key]
    }
  } else {
    datum = addDatum(interview, payload, questionDatum)
  }
  return datum
}

/**
 * Push a single datum to the questionDatum.data array. Uses the recycler
 * @param {Object} interview
 * @param {Object} payload
 * @param {Object} questionDatum
 * @returns {Datum}
 */
export function addDatum (interview: any, payload: any, questionDatum: QuestionDatum) {
  let datum = DatumRecycler.getNoKey(questionDatum, payload)
  questionDatum.data.push(datum)
  return datum
}

/**
 * Add a datum and if we've exceed the supplied limit, we remove the oldest datum
 * @param {Number} limit
 * @returns {Function}
 */
export function addDatumLimit (limit: number) {
  return function (interview: object, payload: object, questionDatum: QuestionDatum) {
    let datum = addDatum(interview, payload, questionDatum)
    if (questionDatum.data.length > limit) {
      questionDatum.data.shift()
    }
    return datum
  }
}
