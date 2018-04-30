import InterviewService from '../interview/InterviewService'
import MockService from '../../../../services/mock/MockService'
import Emitter from '@/classes/Emitter'
// Mock datastore for the actions. In memory of course
export class InterviewActionsMock extends Emitter {
  constructor () {
    super()
    this.store = {}
  }
  getActions () {
    this.emit('getActions')
    return MockService.randomlyFail(resolve => {
      setTimeout(() => {
        let interviewId = InterviewService.getInterviewId()
        let actions = this.store[interviewId] ? JSON.parse(JSON.stringify(this.store[interviewId])) : []
        resolve(actions)
        this.emit('getActionsResolve', actions)
      }, 1000)
    }, InterviewActionsMock.DELAY, InterviewActionsMock.FAILURE_RATE)
  }
  saveActions (actions) {
    this.emit('saveActions', actions)
    return MockService.randomlyFail(resolve => {
      setTimeout(() => {
        let interviewId = InterviewService.getInterviewId()
        if (!this.store[interviewId]) {
          this.store[interviewId] = []
        }
        this.store[interviewId] = this.store[interviewId].concat(JSON.parse(JSON.stringify(actions)));
        (savedActions => {
          setTimeout(() => {
            this.emit('saveActionsResolve', savedActions)
          })
        })(this.store[interviewId])
        return resolve({
          body: {
            msg: 'ok'
          }
        })
      })
    }, InterviewActionsMock.DELAY, InterviewActionsMock.FAILURE_RATE)
  }
  // Just for testing
  clear_ () {
    this.store = {}
  }
  setFailureRate_ (val) {
    InterviewActionsMock.FAILURE_RATE = val
  }
  setDelay_ (val) {
    InterviewActionsMock.DELAY = val
  }
}

InterviewActionsMock.DELAY = 200
InterviewActionsMock.FAILURE_RATE = 0.1

export default new InterviewActionsMock()
