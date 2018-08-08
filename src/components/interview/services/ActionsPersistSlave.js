import PersistSlave from '../../../classes/PersistSlave'
import InterviewService from '../../../services/interview/InterviewService'

/**
 * Creates a persist slave for syncing up actions with the database
 * @param {ActionStore} actionStore
 * @returns {PersistSlave}
 */
export default function actionsPersistSlave (interviewId, actionStore) {
  function actionsExtractor () {
    return actionStore.store
  }
  function saveCallback (newState, prevState) {
    if (newState.length > prevState.length) {
      return InterviewService.saveActions(interviewId, newState.slice(prevState.length))
    } else {
      return new Promise(resolve => resolve())
    }
  }
  return new PersistSlave(actionStore, actionsExtractor, saveCallback)
}
