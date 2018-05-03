import DiffService from '../DiffService'
import {copy, hasConditionChanges, hasDataChanges} from './InterviewDataWeb'
import _ from 'lodash'

export default class InterviewDataMock {
  /**
   * The mock service which is in change of sending data changes to the backend for storage
   * @param dataExtractor
   * @param conditionTagExtractor
   */
  constructor (dataExtractor, conditionTagExtractor) {
    this._previousData = copy(dataExtractor())
    this._previousConditions = copy(conditionTagExtractor())
    this.dataExtractor = dataExtractor
    this.conditionTagExtractor = conditionTagExtractor
    this.send = _.throttle(this.send.bind(this), 5000, {
      leading: false,
      trailing: true
    })
    this.isSending = false    // Indicate if the service is currently sending data
    this.hasDataToSend = false // Indicate that the service needs to send after the current send finishes
  }
  send () {
    if (this.isSending) {
      this.hasDataToSend = true
      // console.log('already sending')
      return
    }
    let dataSnapshot = copy(this.dataExtractor())
    let conditionTagSnapshot = copy(this.conditionTagExtractor())
    let dataDiff = DiffService.dataDiff(dataSnapshot, this._previousData)
    let conditionDiff = DiffService.conditionTagsDiff(conditionTagSnapshot, this._previousConditions)
    // No need to send anything if there aren't any changes
    if (!(hasDataChanges(dataDiff) || hasConditionChanges(conditionDiff))) {
      // console.log('no changes in data detected')
      return
    }
    this.isSending = true
    // console.log('starting send')
    new Promise(resolve => {
      setTimeout(function () {
        resolve({
          status: 201
        })
      }, 1000)
    })
    .then(res => {
      if (res.status >= 200 && res.status < 300) {
        this._previousData = dataSnapshot
        this._previousConditions = conditionTagSnapshot
        console.log(`sent the following patch: ${JSON.stringify({
          data: dataDiff,
          conditionTags: conditionDiff
        }, null, 2)}`)
      } else {
        throw Error('Unable to complete request')
      }
    })
    .catch(err => {
      throw err
    })
    .then(() => {
      this.isSending = false
      // This is to handle any period of time between the send being cancelled and the throttle waiting to call send
      if (this.hasDataToSend) {
        this.send()
        this.hasDataToSend = false
      }
    })
  }
}
