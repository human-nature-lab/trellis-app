import Emitter from '../../../classes/Emitter'
import uuidv4 from 'uuid/v4'
import SortedArray from '../../../classes/SortedArray'
import {now, parseDate} from '../../../services/DateService'
import Action from "../../../entities/trellis/Action";

/**
 * Creates an ordered store that keeps the actions sorted following the order of the form. Actions are accessible via
 * the actions property.
 * @param {Object} blueprint - The form blueprint to use
 */
export default class ActionStore extends Emitter {
  private store: any[]
  private sortedStore: SortedArray<Action>
  private questionIndex: Map<string, Action[]> = new Map()
  private questionToPageIndex: Map<string, number>
  private questionToSectionIndex: Map<string, number>

  constructor (blueprint) {
    super()
    this._createPageAndSectionIndexes(blueprint)
    this.sortedStore = new SortedArray((a: Action, b: Action) => {
      if (a.questionId && b.questionId) {
        let sectionA = this.getActionSection(a)
        let sectionB = this.getActionSection(b)
        if (sectionA === sectionB) {
          if (a.sectionRepetition === b.sectionRepetition) {
            if (a.sectionFollowUpRepetition === b.sectionFollowUpRepetition) {
              let pageA = this.getActionPage(a)
              let pageB = this.getActionPage(b)
              if (pageA === pageB) {
                if (a.createdAt === b.createdAt) {
                  return 0
                } else {
                  return a.createdAt > b.createdAt ? 1 : -1
                }
              } else {
                return pageA - pageB
              }
            } else {
              return a.sectionFollowUpRepetition - b.sectionFollowUpRepetition
            }
          } else {
            return a.sectionRepetition - b.sectionRepetition
          }
        } else {
          return sectionA - sectionB
        }
      } else {
        return <any>(b.questionId != null) - <any>(a.questionId != null)
      }
    })
    this.store = []
    this.questionIndex = new Map()
  }

  /**
   * Emit the initial state to any subscribers
   */
  initialize () {
    this.emit('initialState', this.store)
  }

  /**
   * Create indexes for both the form pages and sections. Improves sort performance.
   * @param {Object} blueprint - A sorted blueprint
   */
  _createPageAndSectionIndexes (blueprint: any) {
    this.questionToPageIndex = new Map()
    this.questionToSectionIndex = new Map()
    for (let s = 0; s < blueprint.sections.length; s++) {
      console.log('action section sort order', blueprint.sections[s].form_sections[0].sort_order)
      for (let p = 0; p < blueprint.sections[s].question_groups.length; p++) {
        console.log('action page sort order', blueprint.sections[s].question_groups[p].pivot.question_group_order)
        for (let question of blueprint.sections[s].question_groups[p].questions) {
          this.questionToPageIndex.set(question.id, p)
          this.questionToSectionIndex.set(question.id, s)
        }
      }
    }
  }

  /**
   * Return the section number of an action
   * @param {Object} action
   * @returns {Number}
   */
  getActionSection (action: Action) {
    if (!action.questionId) return -1
    return this.questionToSectionIndex.get(action.questionId)
  }

  /**
   * Return the page number of an action
   * @param {Object} action
   * @returns {Number}
   */
  getActionPage (action: Action) {
    if (!action.questionId) return -1
    return this.questionToPageIndex.get(action.questionId)
  }

  /**
   * Insert an action while maintaining the actions in a sorted state based on the order of the survey
   * @param {Object} action
   */
  insertIntoStore (action: Action) {
    this.store.push(action)
    this.sortedStore.insertSorted(action)
  }

  /**
   * Convert an action into a sortable number based on the section, repetitions and pages. This conversion should work
   * as long as there are fewer than 100 sections, less than 100 repetitions per sections, less than 100 follow up
   * repetitions and less than 100 questions per page.
   * @param {Object} action
   * @returns {Number}
   */
  actionToNum (a: Action) {
    // TODO: this has quite a few limitations, but it needs to be something that's comparable using > and < which is tough
    // with a string representation of a number since reliable behaviour of string comparison depends on the strings being
    // the same length.
    const millisSortVal = +a.createdAt
    const section = this.questionToSectionIndex.get(a.questionId)
    const page = this.questionToPageIndex.get(a.questionId)
    return section * 1000000 + a.sectionRepetition * 10000 + a.sectionFollowUpRepetition * 100 + page + millisSortVal / 10000000000000
  }

  /**
   * Getter for the actions. Defaults to the ordered store
   * @returns {Array|*}
   */
  get actions () {
    return this.sortedStore
  }

  /**
   * Get the actions for any number of question ids for a specific sectionRepetition and followUpRepetition
   * @param questionIds
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {Array}
   */
  getQuestionActions (questionIds: string[], sectionRepetition: number, sectionFollowUpRepetition: number) {
    let actions = []
    for (let id of questionIds) {
      if (this.questionIndex.has(id)) {
        for (let action of this.questionIndex.get(id)) {
          if (action.sectionRepetition === sectionRepetition && action.sectionFollowUpRepetition === sectionFollowUpRepetition) {
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
    for (let action of actions) {
      if (typeof action.payload === 'string') {
        action.payload = JSON.parse(action.payload)
      }
      if (typeof action.created_at === 'string') {
        action.created_at = parseDate(action.created_at)
      }
      this.insertIntoStore(action)
    }
  }

  /**
   * Add an action to the store. This will trigger the throttled persist method
   * @param action
   */
  add (action: Action, location: any) {
    action.sectionRepetition = location.sectionRepetition
    action.sectionFollowUpRepetition = location.sectionFollowUpDatumRepetition
    action.createdAt = now()
    this.insertIntoStore(action)
    this.emit('change', this.store)
  }

  /**
   * Save the action in the store and update any indexes
   * @param action
   */
  save (action: Action) {
    this.store.push(action)
    if (action.questionId) {
      let questionActions = this.questionIndex.get(action.questionId)
      if (!questionActions) {
        questionActions = []
        this.questionIndex.set(action.questionId, questionActions)
      }
      questionActions.push(action)
    }
  }

  /**
   * Get all actions for a page
   */
  getLocationActions (location: any) {
    // TODO: Should handle sectionRepetition and sectionFollowUpRepetition too
    return this.store.filter(action => action.section === location.section && action.page === location.page)
  }
}
