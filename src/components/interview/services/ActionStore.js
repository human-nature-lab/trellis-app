import InterviewActionsService from './interview-actions/InterviewActionsService'
import _ from 'lodash'
export default class ActionStore {
  constructor (throttleRate = 1000) {
    this.store = []
    this._lastPersistedLength = 0
    this._existingRequest = null
    this.persist = _.debounce(this.persist.bind(this), throttleRate, {
      leading: false,
      maxWait: throttleRate
    })
  }

  /**
   * Getter for the actions
   * @returns {Array|*}
   */
  get actions () {
    return this.store
  }

  /**
   * Load the actions into the store without triggering the persist method
   * @param {array} actions
   */
  load (actions) {
    this.store = this.store.concat(actions)
    this._lastPersistedLength = this.store.length
  }

  /**
   * Add an action to the store. This will trigger the throttled persist method
   * @param action
   */
  add (action) {
    this.store.push(action)
    this.hasAddedData = true
    this.persist()
  }

  /**
   * Actually save the data via the InterviewActionsService.saveActions method, whatever that may be. This method will
   * call itself again if data has been added to the store since it last ran
   */
  persist () {
    if (this._existingRequest) {
      console.log('action saving request in progress')
      return
    }
    this.hasAddedData = false
    this._existingRequestLength = this.store.length
    console.log('saving actions', this.actions.length)
    this._existingRequest = InterviewActionsService.saveActions(this.store.slice(this._lastPersistedLength)).then(body => {
      this._existingRequest = null
      this._lastPersistedLength = this._existingRequestLength - 1
      // Make another throttled request if there is new data already
      if (this.hasAddedData) {
        this.persist()
      }
    }).catch(() => {
      this._existingRequest = null
    })
  }
}
