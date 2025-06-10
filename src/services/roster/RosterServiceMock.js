import { v4 as uuid } from 'uuid'
import MockService from '../mock/MockService'
import storage from '@/services/storage/StorageService'
export default class RosterServiceMock {
  static getRosterRows (rosterIds) {
    return MockService.randomlyFail(resolve => {
      return resolve(rosterIds.map(id => {
        if (storage.get(`roster-${id}`, 'object')) {
          return storage.get(`roster-${id}`, 'object')
        } else {
          return {
            id: uuid(),
            val: 'Unsaved roster row'
          }
        }
      }))
    }, RosterServiceMock.DELAY, RosterServiceMock.FAILURE_RATE)
  }
  static createRosterRows (rosterRows) {
    return MockService.randomlyFail(resolve => {
      return resolve(rosterRows.map(r => {
        let row = {
          id: uuid(),
          val: r
        }
        storage.set(`roster-${row.id}`, row)
        return row
      }))
    }, RosterServiceMock.DELAY + 1000, RosterServiceMock.FAILURE_RATE)
  }
  static editRosterRow (changedRow) {
    return MockService.randomlyFail(resolve => {
      storage.set(`roster-${changedRow.id}`, changedRow)
      return resolve(changedRow)
    }, RosterServiceMock.DELAY, RosterServiceMock.FAILURE_RATE)
  }
}

RosterServiceMock.DELAY = 500
RosterServiceMock.FAILURE_RATE = 0.05
