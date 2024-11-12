import { snakeToCamel } from '../../../../services/JSONUtil'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import Datum from '../../../../entities/trellis/Datum'
import InterviewManager from '../../classes/InterviewManager'
import { ActionHandler } from './ActionManager'
import Action from '../../../../entities/trellis/Action'
import { defaultLoggingService } from '../../../../services/logging'
import { ActionPayload } from './ActionPayload'

interface DatumFindFunc {
  (value: Datum, payload: ActionPayload): boolean
}

/**
 * Update a datum with whatever is in the action payload
 * @param {Function} findFunc
 * @param {string} [title]
 * @returns {Function<Datum>}
 */
export function updateDatum (findFunc: DatumFindFunc, title?: string): ActionHandler {
  return function (interview: InterviewManager, action: Action, questionDatum: QuestionDatum): Datum {
    let datum = questionDatum.data.find(d => {
      return findFunc(d, action.payload)
    })
    if (datum) {
      for (let key in action.payload) {
        datum[key] = action.payload[key]
      }
    } else {
      let msg = 'Cant update datum. No datum exists that matches this find closure.'
      if (title) msg += `Found in ${title}`
      defaultLoggingService.log({ msg })
    }
    return datum
  }
}

/**
 * Remove a single datum from the questionDatum.data array using the find closure supplied
 * @param {DatumFindFunc} findFunc - A closure which should identify the correct datum to remove
 * @param {string} title
 * @returns {(interview: object, payload: ActionPayload, questionDatum: QuestionDatum) => Datum}
 */
export function removeDatum (findFunc: DatumFindFunc, title?: string): ActionHandler {
  return function (interview: InterviewManager, action: Action, questionDatum: QuestionDatum): Datum {
    let index = questionDatum.data.findIndex(datum => {
      return findFunc(datum, action.payload)
    })
    if (index > -1) {
      return questionDatum.data.splice(index, 1)[0]
    } else {
      let msg = 'Cant remove datum. No datum exists that matches this find closure.'
      if (title) msg += `Found in ${title}`
      defaultLoggingService.log({ msg })
    }
  }
}

/**
 * Remove all data from a QuestionDatum.
 * @param interview
 * @param action
 * @param questionDatum
 */
export function removeAllDatum (interview: InterviewManager, action: Action, questionDatum: QuestionDatum) {
  questionDatum.data.splice(0, questionDatum.data.length)
}

/**
 * If the datum exists it will be updated with all values in the payload. If there isn't a datum, one will be created.
 * @param {InterviewManager} interview
 * @param {Action} action
 * @param {QuestionDatum} questionDatum
 * @returns {any}
 */
export function addOrUpdateSingleDatum (interview: InterviewManager, action: Action, questionDatum: QuestionDatum) {
  let datum
  if (questionDatum.data.length) {
    datum = questionDatum.data[0]
    for (let key in action.payload) {
      let camel = snakeToCamel(key)
      datum[camel] = action.payload[key]
    }
  } else {
    datum = addDatum(interview, action, questionDatum)
  }
  return datum
}

/**
 * Push a single datum to the questionDatum.data array. Uses the recycler.
 * @param {InterviewManager} interview
 * @param {Action} action
 * @param {QuestionDatum} questionDatum
 * @returns {Datum}
 */
export function addDatum (interview: InterviewManager, action: Action, questionDatum: QuestionDatum) {
  return interview.data.addDatum(questionDatum, questionDatum, action)
}

/**
 * Add a datum and if we've exceed the supplied limit, we remove the oldest datum
 * @param {Number} limit
 * @returns {Function}
 */
export function addDatumLimit (limit: number): ActionHandler {
  return function (interview: InterviewManager, action, questionDatum: QuestionDatum) {
    let datum = addDatum(interview, action, questionDatum)
    if (questionDatum.data.length > limit) {
      questionDatum.data.shift()
    }
    return datum
  }
}
