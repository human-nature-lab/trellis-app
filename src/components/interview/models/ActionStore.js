import Emitter from '../../../classes/Emitter'
import uuidv4 from 'uuid/v4'
export default class ActionStore extends Emitter {
  constructor () {
    super()
    this.store = []
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
    this.emit('initialState', this.store)
  }

  /**
   * Add an action to the store. This will trigger the throttled persist method
   * @param action
   */
  add (action, location) {
    action.id = uuidv4()
    action.section = location.section
    action.section_repetition = location.sectionRepetition
    action.section_follow_up_repetition = location.sectionFollowUpDatumRepetition
    action.page = location.page
    action.created_at = (new Date()).getTime()
    this.store.push(action)
    this.emit('change', this.store)
  }

  /**
   * Get all actions for a page
   */
  getLocationActions (location) {
    // TODO: Should handle sectionRepetition and sectionFollowUpRepetition too
    return this.store.filter(action => action.section === location.section && action.page === location.page)
  }
}
