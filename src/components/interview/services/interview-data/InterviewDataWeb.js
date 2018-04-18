import DiffService from '../DiffService'
import http from '@/services/http/AxiosInstance'
// import _ from 'lodash'
export default class InterviewDataWeb {
  /**
   * The mock service which is in change of sending data changes to the backend for storage
   * @param dataExtractor
   * @param conditionTagExtractor
   */
  constructor (dataExtractor, conditionTagExtractor) {
    this.routes = {
      data: 'interview/data',
      conditions: 'interview/conditions'
    }
    this.isAlreadyMakingRequest = false
    this._previousData = copy(dataExtractor())                // Initial state of the data
    this._previousConditions = copy(conditionTagExtractor())  // Intial state of the conditions
    this.dataExtranctor = dataExtractor                       // This should be a reference to the questionDatum array for the interview
    this.conditionTagExtractor = conditionTagExtractor        // This should be a reference to the conditions object for the interview
    this.maxFailures = 10
    this._failCount = 0
    // this.send = _.throttle(this.send.bind(this), 2000)
  }

  /**
   * Send the data :). Basically do a diff of the existing data and then send the differences to the server
   */
  send () {
    if (this.isAlreadyMakingRequest || this._failCount > this.maxFailures) return
    // We need to make a copy of the state of the data reference at this point in time so we don't lose data that is created
    // while this request is happening
    let dataSnapshot = copy(this.dataExtranctor())
    let conditionTagSnapshot = copy(this.conditionTagExtractor())
    let dataDiff = DiffService.dataDiff(dataSnapshot, this._previousData)
    let conditionDiff = DiffService.conditionTagsDiff(conditionTagSnapshot, this._previousConditions)
    // No need to send anything if there aren't any changes
    if (!(hasDataChanges(dataDiff) || hasConditionChanges(conditionDiff))) return
    http().post(`data`, {
      data: dataDiff,
      conditionTags: conditionDiff
    }).then(res => {
      this.isAlreadyMakingRequest = false
      if (res.status >= 200 && res.status < 300) {
        this._previousData = dataSnapshot
        this._previousConditions = conditionTagSnapshot
        this.onSuccess()
      } else {
        throw Error('Unable to complete request')
      }
    }).catch(err => {
      this.isAlreadyMakingRequest = false
      this.onError(err)
    })
  }
  onSuccess () {
    this._failCount = 0
    console.log('Successfully stored data')
  }
  onError (err) {
    this._failCount++
    console.error(err)
  }
}

/**
 * Check if the data diff has any data
 * @param diff - Result of [DiffService#dataDiff]{@link DiffService#dataDiff}
 * @returns {boolean}
 */
export function hasDataChanges (diff) {
  return diff.questionDatum.added.length > 0 ||
    diff.questionDatum.modified.length > 0 ||
    diff.questionDatum.removed.length > 0 ||
    diff.datum.added.length > 0 ||
    diff.datum.removed.length > 0 ||
    diff.datum.modified.length > 0
}

/**
 * Check if the condition diff has any data
 * @param diff - Result of [DiffService#conditionTagsDiff]{@link DiffService#conditionTagsDiff}
 * @returns {boolean}
 */
export function hasConditionChanges (diff) {
  return diff.section.added.length > 0 || diff.section.removed.length > 0 ||
    diff.respondent.added.length > 0 || diff.respondent.removed.length > 0 ||
    diff.form.added.length > 0 || diff.form.removed.length > 0
}

/**
 * Make a deep copy of an object
 * @param json
 * @returns {object|array}
 */
export function copy (json) {
  return JSON.parse(JSON.stringify(json))
}
