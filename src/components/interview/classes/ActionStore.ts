import Emitter from '../../../classes/Emitter'
import SortedArray from '../../../classes/SortedArray'
import {now, parseDate} from '../../../services/DateService'
import Action from '../../../entities/trellis/Action'
import Form from '../../../entities/trellis/Form'
import {InterviewLocation} from '../services/InterviewNavigator'
import AT from '../../../static/action.types'
import {locToNumber} from "../services/LocationHelpers";
import {ActionPayload} from "../services/actions/DatumOperations";

/**
 * Creates an ordered store that keeps the actions sorted following the order of the form. Actions are accessible via
 * the actions property.
 * @param {Object} blueprint - The form blueprint to use
 */
export default class ActionStore extends Emitter {
  public store: any[]
  public lastRealAction: Action|null = null
  private lastRealActionLocNum: number = -1
  private sortedStore: SortedArray<Action>
  private questionIndex: Map<string, Action[]> = new Map()
  private questionToPageIndex: Map<string, number>
  private questionToSectionIndex: Map<string, number>

  constructor (blueprint: Form) {
    super()
    this._createPageAndSectionIndexes(blueprint)
    this.sortedStore = new SortedArray((a: Action, b: Action) => {
      if (a.questionId && b.questionId) {
        const aLocNum = locToNumber(this.actionToLocation(a))
        const bLocNum = locToNumber(this.actionToLocation(b))
        if (aLocNum === bLocNum) {
          const aHasN = a.payload  && a.payload['n'] !== null && a.payload['n'] !== undefined
          const bHasN = b.payload && b.payload['n'] !== null && b.payload['n'] !== undefined
          if (aHasN && bHasN) {
            return a.payload['n'] - b.payload['n']
          } else if (aHasN) {
            return 1
          } else if (bHasN) {
            return -1
          } else {
            if (a.createdAt === b.createdAt) {
              return 0
            } else {
              return a.createdAt > b.createdAt ? 1 : -1
            }
          }
        } else {
          return aLocNum - bLocNum
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
  initialize (): void {
    this.emit('initialState', this.store)
  }

  /**
   * Create indexes for both the form pages and sections. Improves sort performance.
   * @param {Form} blueprint
   * @private
   */
  _createPageAndSectionIndexes (blueprint: Form): void {
    this.questionToPageIndex = new Map()
    this.questionToSectionIndex = new Map()
    for (let s = 0; s < blueprint.sections.length; s++) {
      // console.log('action section sort order', blueprint.sections[s].formSections[0].sortOrder)
      for (let p = 0; p < blueprint.sections[s].pages.length; p++) {
        // console.log('action page sort order', blueprint.sections[s].pages[p].sectionQuestionGroup.questionGroupOrder)
        for (let question of blueprint.sections[s].pages[p].questions) {
          this.questionToPageIndex.set(question.id, p)
          this.questionToSectionIndex.set(question.id, s)
        }
      }
    }
  }

  /**
   * Return the section number of an action
   * @param {Action} action
   * @returns {any}
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
   * @param {Action} action
   */
  insertIntoStore (action: Action) {
    this.store.push(action)
    this.sortedStore.insertSorted(action)
    if (!action.payload) {
      action.payload = {} as ActionPayload
    }
    if (action.payload['n'] === undefined || action.payload['n'] === null) {
      action.payload['n'] = this.store.length
    }
    console.log('actions', JSON.stringify(this.actions.map(a => [a.actionType, a.payload['n']])))
    if (action.preloadActionId === null && action.actionType !== AT.next && action.actionType !== AT.previous && action.questionId !== null) {
      const actionLocNum = locToNumber(this.actionToLocation(action))
      if (!this.lastRealAction || (this.lastRealAction && actionLocNum > this.lastRealActionLocNum)) {
        this.lastRealAction = action
        this.lastRealActionLocNum = actionLocNum
      }
    }
  }

  /**
   * Convert an action into a valid InterviewLocation
   * @param {Action} action
   * @returns {InterviewLocation}
   */
  actionToLocation (action: Action): InterviewLocation {
    return {
      section: this.questionToSectionIndex.get(action.questionId),
      page: this.questionToPageIndex.get(action.questionId),
      sectionRepetition: action.sectionRepetition,
      sectionFollowUpRepetition: action.sectionFollowUpRepetition
    }
  }

  /**
   * Getter for the actions. Defaults to the ordered store
   * @returns {Action[]}
   */
  public get actions (): Action[] {
    return this.sortedStore
  }

  /**
   * Get the actions for any number of question ids for a specific sectionRepetition and followUpRepetition
   * @param questionIds
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {Array}
   */
  getQuestionActions (questionIds: string[], sectionRepetition: number, sectionFollowUpRepetition: number): Action[] {
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
  load (actions: Action[]): void {
    for (let action of actions) {
      if (action.payload && typeof action.payload === 'string') {
        action.payload = JSON.parse(action.payload)
      }
      this.insertIntoStore(action)
    }
  }

  /**
   * Add an action to the store. This will trigger the throttled persist method
   * @param {Action} action
   * @param {InterviewLocation} location
   */
  add (action: Action, location: InterviewLocation): void {
    action.sectionRepetition = location.sectionRepetition
    action.sectionFollowUpRepetition = location.sectionFollowUpRepetition
    action.createdAt = action.createdAt || now()
    this.insertIntoStore(action)
    this.emit('change', this.store)
  }

  /**
   * Save the action in the store and update any indexes
   * @param {Action} action
   */
  save (action: Action): void {
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
   * Returns true if an action matches a location
   * @param {Action} action
   * @param {InterviewLocation} location
   * @returns {boolean}
   */
  matchesLocation (action: Action, location: InterviewLocation): boolean {
    return this.getActionSection(action) === location.section &&
      this.getActionPage(action) === location.page &&
      action.sectionRepetition === location.sectionRepetition &&
      action.sectionFollowUpRepetition === location.sectionFollowUpRepetition
  }

  /**
   * Get all actions for a page
   * @param {InterviewLocation} location
   * @returns {Action[]}
   */
  getLocationActions (location: InterviewLocation): Action[] {
    // TODO: Should handle sectionRepetition and sectionFollowUpRepetition too
    return this.store.filter(action => action.section === location.section && action.page === location.page)
  }
}
