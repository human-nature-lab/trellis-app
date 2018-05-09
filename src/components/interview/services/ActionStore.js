import InterviewActionsService from './interview-actions/InterviewActionsService'
import _ from 'lodash'
import uuidv4 from 'uuid/v4'
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
    actions.sort((a, b) => a.created_at > b.created_at)
    this.store = this.store.concat(actions)
    this._lastPersistedLength = this.store.length
  }

  /**
   * Add an action to the store. This will trigger the throttled persist method
   * @param action
   */
  add (action, location) {
    action.id = uuidv4()
    action.section = location.section
    delete action.question_datum_id
    // action.section_repetition = location.sectionRepetition
    // action.section_follow_up_repetition = location.sectionFollowUpDatumRepetition
    action.page = location.page
    action.created_at = (new Date()).getTime()
    this.store.push(action)
    this.hasAddedData = true
    this.persist()
  }

  /**
   * Get all actions for a page
   */
  getLocationActions (location) {
    // TODO: Should handle sectionRepetition and sectionFollowUpRepetition too
    return this.store.filter(action => action.section === location.section && action.page === location.page)
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
      this._lastPersistedLength = this._existingRequestLength
      // Make another throttled request if there is new data already
      if (this.hasAddedData) {
        this.persist()
      }
    }).catch(() => {
      this._existingRequest = null
    })
  }
}
