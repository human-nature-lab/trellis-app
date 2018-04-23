import uuid from 'uuid/v4'
import MockService from '../mock/MockService'
const fakeRespondents = [{
  id: uuid(),
  assigned_id: 'fake-1',
  geo_id: uuid(),
  notes: '',
  geo_notes: '',
  name: 'Fake 1',
  created_at: new Date().getTime(),
  updated_at: new Date().getTime(),
  deleted_at: null
}, {
  id: uuid(),
  assigned_id: 'fake-2',
  geo_id: uuid(),
  notes: '',
  geo_notes: '',
  name: 'Fake 2',
  created_at: new Date().getTime(),
  updated_at: new Date().getTime(),
  deleted_at: null
}, {
  id: uuid(),
  assigned_id: 'fake-3',
  geo_id: uuid(),
  notes: '',
  geo_notes: '',
  name: 'Fake 3',
  created_at: new Date().getTime(),
  updated_at: new Date().getTime(),
  deleted_at: null
}]
const SERVICE_DELAY = 1000
const NETWORK_ERROR_CHANCE = 0.1

export default class RespondentServiceMock {
  static getRespondentById (respondentId) {
    return MockService.randomlyFail((resolve, reject) => {
      let respondent = fakeRespondents.find(r => r.id === respondentId)
      if (respondent) {
        return resolve(respondent)
      } else {
        return reject(new Error('Unable to find respondent with that id'))
      }
    }, SERVICE_DELAY, NETWORK_ERROR_CHANCE)
  }
  static getRespondents () {
    return MockService.randomlyFail(resolve => resolve(fakeRespondents), SERVICE_DELAY, NETWORK_ERROR_CHANCE)
  }
  static searchRespondents (query, filter) {
    return MockService.randomlyFail(resolve => {
      let results = []
      for (let r of fakeRespondents) {
        if (r.assigned_id.includes(query) || r.name.includes(query)) {
          results.push(r)
        }
      }
      resolve(JSON.parse(JSON.stringify(results)))
    }, SERVICE_DELAY, NETWORK_ERROR_CHANCE)
  }
}
