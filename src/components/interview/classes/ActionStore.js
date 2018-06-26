import Emitter from '../../../classes/Emitter'
import uuidv4 from 'uuid/v4'
export default class ActionStore extends Emitter {
  constructor () {
    super()
    this.store = []
    this.questionIndex = new Map()
  }

  /**
   * Getter for the actions
   * @returns {Array|*}
   */
  get actions () {
    return this.store
  }

  /**
   * Get the actions for any number of question ids for a specific sectionRepetition and followUpRepetition
   * @param questionIds
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {Array}
   */
  getQuestionActions (questionIds, sectionRepetition, sectionFollowUpRepetition) {
    let actions = []
    for (let id of questionIds) {
      if (this.questionIndex.has(id)) {
        for (let action of this.questionIndex.get(id)) {
          if (action.section_repetition === sectionRepetition && action.section_follow_up_repetition === sectionFollowUpRepetition) {
            actions.push(action)
          }
        }
      }
    }
    return actions
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
    action.section_repetition = location.sectionRepetition
    action.section_follow_up_repetition = location.sectionFollowUpDatumRepetition
    action.created_at = (new Date()).getTime()
    this.save(action)
    this.emit('change', this.store)
  }

  /**
   * Save the action in the store and update any indexes
   * @param action
   */
  save (action) {
    this.store.push(action)
    if (action.question_id) {
      let questionActions = this.questionIndex.get(action.question_id)
      if (!questionActions) {
        questionActions = []
        this.questionIndex.set(action.question_id, questionActions)
      }
      questionActions.push(action)
    }
  }

  /**
   * Get all actions for a page
   */
  getLocationActions (location) {
    // TODO: Should handle sectionRepetition and sectionFollowUpRepetition too
    return this.store.filter(action => action.section === location.section && action.page === location.page)
  }
}
