import PersistSlave from '../../../classes/PersistSlave'
import InterviewActionsService from './interview-actions/InterviewActionsService'

/**
 * Creates a persist slave for syncing up actions with the database
 * @param {ActionStore} actionStore
 * @returns {PersistSlave}
 */
export default function actionsPersistSlave (interviewId, actionStore) {
  function actionsExtractor () {
    return actionStore.actions
  }
  function saveCallback (newState, prevState) {
    let lastPersistedLength = newState.length - prevState.length
    return InterviewActionsService.saveActions(interviewId, newState.slice(lastPersistedLength))
  }
  return new PersistSlave(actionStore, actionsExtractor, saveCallback)
}
