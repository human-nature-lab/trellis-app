import Emitter from '../../../classes/Emitter'
import {now, parseDate} from '../../../services/DateService'
import Action from '../../../entities/trellis/Action'
import Form from '../../../entities/trellis/Form'
import {InterviewLocation} from '../services/InterviewAlligator'
import AT from '../../../static/action.types'
import {locToNumber} from "../services/LocationHelpers";
import {ActionPayload} from "../services/actions/DatumOperations";
import {randomIntBits} from "../../../classes/M";
import InterviewService from "../../../services/interview/InterviewService";
import {Mutex, MutexInterface}from "async-mutex";

/**
 * Creates an ordered store that keeps the actions sorted following the order of the form. Actions are accessible via
 * the actions property.
 * @param {Object} blueprint - The form blueprint to use
 */
export default class ActionStore extends Emitter {
  public store: any[]
  public lastRealAction: Action|null = null
  public questionBins: Map<string, Action[]> = new Map()
  private lastRealActionLocNum: number = -1
  private questionIndex: Map<string, Action[]> = new Map()
  private questionToPageIndex: Map<string, number>
  private questionToSectionIndex: Map<string, number>
  private mutex: Mutex = new Mutex()
  private releaseMutex!: MutexInterface.Releaser

  private previousLength: number = 0

  constructor (blueprint: Form) {
    super()
    this._createPageAndSectionIndexes(blueprint)
    this.store = []
    this.questionIndex = new Map()
  }

  /**
   * Emit the initial state to any subscribers
   */
  initialize (): void {
    this.previousLength = this.store.length
    this.emit('initialState', this.store)
  }

  /**
   * Store the actions in the database
   * @param interviewId
   */
  async save (interviewId: string): Promise<void> {
    // Prevent overlapping
    console.log('waiting to acquire action mutex')
    this.releaseMutex = await this.mutex.acquire()
    console.log('acquired action mutex')
    // Try without catch block still throws the error after running finally block!
    try {
      const newLength = this.store.length
      if (newLength > this.previousLength) {
        console.log('saving actions', newLength, this.previousLength, this.store.slice(this.previousLength))
        await InterviewService.saveActions(interviewId, this.store.slice(this.previousLength))
        console.log('updating actions length')
        this.previousLength = newLength
      } else {
        console.log('no new actions')
      }
    } finally {
      console.log('releasing actions mutex')
      this.releaseMutex()
    }

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

  private makeBinKey (questionId: string, followUpActionId?: string, repetition?: number): string {
    if (!followUpActionId) followUpActionId = null
    if (!repetition) repetition = null
    return `${questionId}-${followUpActionId}-${repetition}`
  }

  private insertIntoQuestionBins (action: Action) {
    const key = this.makeBinKey(action.questionId, action.followUpActionId, action.sectionRepetition)
    let questionActions = this.questionBins.get(key)
    if (!questionActions) {
      questionActions = []
      this.questionBins.set(key, questionActions)
    }
    questionActions.push(action)
    questionActions.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  /**
   * Returns an array of actions that are valid for this question
   * @param {string} questionId
   * @param {string} followUpActionId
   * @param {number} repetition
   * @returns {Action[] | null}
   */
  public getQuestionActions (questionId: string, followUpActionId?: string, repetition?: number): Action[] | null {
    const key = this.makeBinKey(questionId, followUpActionId, repetition)
    return this.questionBins.get(key)
  }

  /**
   * Insert an action while maintaining the actions in a sorted state based on the order of the survey
   * @param {Action} action
   */
  insertIntoStore (action: Action) {
    if (!action.payload) {
      action.payload = {} as ActionPayload
    }
    if (action.payload.val == null) {
      action.payload.val = ''
    } else if (typeof action.payload.val !== 'string') {
      action.payload.val = '' + action.payload.val
    }
    if (action.sortOrder === undefined || action.sortOrder === null) {
      action.sortOrder = this.store.length
    }
    if (action.randomSortOrder === undefined || action.randomSortOrder === null) {
      action.randomSortOrder = randomIntBits(53)
    }
    if (action.preloadActionId === null && action.actionType !== AT.next && action.actionType !== AT.previous && action.questionId !== null) {
      const actionLocNum = locToNumber(this.actionToLocation(action))
      if (!this.lastRealAction || (this.lastRealAction && actionLocNum > this.lastRealActionLocNum)) {
        this.lastRealAction = action
        this.lastRealActionLocNum = actionLocNum
      }
    }
    this.store.push(action)
    this.insertIntoQuestionBins(action)
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
   * Getter for the actions.
   * @returns {Action[]}
   */
  public get actions (): Action[] {
    return this.store
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
   * @param {string} followUpActionId
   * @param {number} sectionRepetition
   */
  add (action: Action, followUpActionId: string, sectionRepetition: number): void {
    action.sectionRepetition = sectionRepetition
    action.followUpActionId = followUpActionId
    action.createdAt = action.createdAt || now()
    this.insertIntoStore(action)
    this.emit('change', this.store)
  }

}
