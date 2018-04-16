import moxios from 'moxios'
import http from '@/services/http/AxiosInstance'
import uuid from 'uuid/v4'
import InterviewDataWeb from '@/components/interview/services/interview-data/InterviewDataWeb'

const copy = InterviewDataWeb.copy

describe('InterviewDataWeb.spec', () => {
  let data
  let conditions
  let dataService
  let qDatum = [{
    id: uuid(),
    datum: [{
      id: uuid(),
      val: 'And stuff'
    }, {
      id: uuid(),
      val: 'Roundabout'
    }]
  }, {
    id: uuid(),
    datum: [{
      id: uuid(),
      val: 'More stuff'
    }]
  }]
  beforeEach(() => {
    moxios.install(http())
    data = []
    conditions = {
      respondent: [],
      section: [],
      form: []
    }
    dataService = new InterviewDataWeb(data, conditions)
  })
  afterEach(() => {
    moxios.uninstall(http())
  })
  it('should save data changes', () => {
    data.push(qDatum[0])
    dataService.send()
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 201,
        response: {
          created: 1,
          modified: 0,
          removed: 0
        }
      }).then(() => {
        expect(dataService.dataRef).to.equal(data, 'The data reference was broken some how')
        expect(dataService._previousData).to.deep.equal(data, 'The copy of the data is incorrect')
      })
    })
  })
  it('should handle data changes that occur during a save', () => {
    data.push(copy(qDatum[0]))
    dataService.send()
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      data.push(copy(qDatum[1]))
      request.respondWith({
        status: 201,
        response: {
          created: 1,
          modified: 0,
          removed: 0
        }
      }).then(() => {
        expect(dataService._previousData).to.deep.equal([qDatum[0]], 'The cached data should be the same as when the previous data was sent')
      }).then(() => {
        data.send()
        moxios.wait(() => {
          let request = moxios.requests.mostRecent()
          request.respondWith({
            status: 201,
            response: {
              created: 1,
              modified: 0,
              removed: 0
            }
          }).then(() => {
            expect(dataService._previousData).to.deep.equal(copy(data), 'The cached data should be the same has the dataRef')
          })
        })
      })
    })
  })
})
