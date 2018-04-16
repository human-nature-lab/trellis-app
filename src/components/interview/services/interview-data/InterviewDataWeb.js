import DiffService from '../DiffService'
import http from '@/services/http/AxiosInstance'
export default class InterviewDataWeb {
  constructor (data, conditions) {
    this.routes = {
      data: 'interview/data',
      conditions: 'interview/conditions'
    }
    this.isAlreadyMakingRequest = false
    this._previousData = InterviewDataWeb.copy(data)              // Initial state of the data
    this._previousConditions = InterviewDataWeb.copy(conditions)  // Intial state of the conditions
    this.dataRef = data              // This should be a reference to the questionDatum array for the interview
    this.conditionsRef = conditions  // This should be a reference to the conditions object for the interview
    this.maxFailures = 10
    this._failCount = 0
  }

  /**
   * Send the data :). Basically do a diff of the existing data and then send the differences to the server
   */
  send () {
    if (this.isAlreadyMakingRequest) return
    // We need to make a copy of the state of the data reference at this point in time so we don't lose data that is created
    // while this request is happening
    let dataSnapshot = InterviewDataWeb.copy(this.dataRef)
    let conditionTagSnapshot = InterviewDataWeb.copy(this.conditionsRef)
    let dataDiff = DiffService.dataDiff(dataSnapshot, this._previousData)
    let conditionDiff = DiffService.conditionTagsDiff(conditionTagSnapshot, this._previousConditions)
    // No need to send anything if there aren't any changes
    if (!InterviewDataWeb.hasDataChanges(dataDiff) &&
      !InterviewDataWeb.hasConditionChanges(conditionDiff) &&
      this._failCount > this.maxFailures) return
    http().post(`data`, {
      data: dataDiff,
      conditionTags: conditionDiff
    })
      .then(res => {
        this.isAlreadyMakingRequest = false
        if (res.status >= 200 && res.status < 300) {
          this._previousData = dataSnapshot
          this._previousConditions = conditionTagSnapshot
          this.onSuccess()
        } else {
          throw Error('Unable to complete request')
        }
      })
      .catch(err => {
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

  /**
   * Check if the data diff has any data
   * @param diff - Result of [DiffService#dataDiff]{@link DiffService#dataDiff}
   * @returns {boolean}
   */
  static hasDataChanges (diff) {
    return diff.questionDatum.added.length ||
      diff.questionDatum.modified.length ||
      diff.questionDatum.removed.length ||
      diff.datum.added.length ||
      diff.datum.removed.length ||
      diff.datum.modified.length
  }

  /**
   * Check if the condition diff has any data
   * @param diff - Result of [DiffService#conditionTagsDiff]{@link DiffService#conditionTagsDiff}
   * @returns {boolean}
   */
  static hasConditionChanges (diff) {
    return diff.section.added.length || diff.section.removed.length || diff.respondent.added.length || diff.respondent.removed.length || diff.form.added.length || diff.form.removed.length
  }

  /**
   * Make a deep copy of an object
   * @param json
   * @returns {object|array}
   */
  static copy (json) {
    return JSON.parse(JSON.stringify(json))
  }
}
