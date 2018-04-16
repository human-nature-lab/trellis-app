import DiffService from '../DiffService'
import {copy} from './InterviewDataWeb'
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
    this.send = _.throttle(this.send.bind(this), 2000, {
      trailing: true
    })
  }
  send () {
    let dataSnapshot = copy(this.dataExtractor())
    let conditionTagSnapshot = copy(this.conditionTagExtractor())
    let dataDiff = DiffService.dataDiff(dataSnapshot, this._previousData)
    let conditionDiff = DiffService.conditionTagsDiff(conditionTagSnapshot, this._previousConditions)
    // No need to send anything if there aren't any changes
    // if (!hasDataChanges(dataDiff) &&
    //   !hasConditionChanges(conditionDiff)) return
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
        console.log('sent the following patch', copy({
          data: dataDiff,
          conditions: conditionDiff
        }))
      } else {
        throw Error('Unable to complete request')
      }
    })
    .catch(err => {
      throw err
    })
  }
}
