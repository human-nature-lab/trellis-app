import ActionStore from '../../../src/components/interview/classes/ActionStore'
import InterviewActionsService from '../../../src/components/interview/services/interview-actions/InterviewActionsMock'
describe('ActionStore.spec', () => {
  beforeEach(() => {
    InterviewActionsService.setFailureRate_(0)
    InterviewActionsService.setDelay_(200)
  })
  it('should save data eventually', () => {
    InterviewActionsService.clear_()
    let actions = new ActionStore(500)
    return new Promise(resolve => {
      actions.add({
        action_type: 'random'
      })
      InterviewActionsService.on('saveActionsResolve', savedActions => {
        setTimeout(() => {
          expect(actions.actions).to.deep.equal(savedActions, 'the saved actions and the action store should be in sync')
          resolve()
        })
      })
    })
  }).timeout(8000)
  it('should throttle multiple changes', () => {
    InterviewActionsService.clear_()
    let actions = new ActionStore(500)
    return new Promise(resolve => {
      console.log('adding 0')
      actions.add({
        action_type: 'random'
      })
      setTimeout(() => {
        console.log('adding 1')
        actions.add({
          'asdlkfj;asdff': 'asdflkfldsakjf'
        })
      }, 200)
      setTimeout(() => {
        console.log('adding 2')
        actions.add({
          'llfkdllss': 'asdfkfjfjfjf'
        })
      }, 400)
      let wasCalled = false
      InterviewActionsService.on('saveActionsResolve', (savedActions) => {
        setTimeout(function () {
          expect(wasCalled).to.equal(false, 'This should not have been called more than once')
          wasCalled = true
          debugger
          expect(savedActions).to.deep.equal(actions.store, 'The data should be the same regardless of how many times the data is persisted')
          return resolve()
        }, 4000)
      })
    })
  }).timeout(8000)
})
