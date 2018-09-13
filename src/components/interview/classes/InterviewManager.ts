import SkipService from '../services/SkipService'
import actionManager from '../services/actions/InterviewActionDefinitions'
import ActionStore from './ActionStore'
import DataStore from './DataStore'
import dataPersistSlave from '../services/DataPersistSlave'
import actionsPersistSlave from '../services/ActionsPersistSlave'

import InterviewNavigator from '../services/InterviewNavigator'
import Form from '../../../entities/trellis/Form'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Action from '../../../entities/trellis/Action'
import ConditionTagInterface from '../../../services/condition-tag/ConditionTagInterface'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Interview from '../../../entities/trellis/Interview'
import InterviewManagerBase from "./InterviewManagerBase";


export default class InterviewManager extends InterviewManagerBase {

  private _isReplaying: boolean

  constructor (
    interview: Interview,
    blueprint: Form,
    actions?: Action[],
    data?: QuestionDatum[],
    conditionTags?: ConditionTagInterface,
    respondentFills?: RespondentFill[]
  ) {
    super()

    // Indexes and data stores
    this.interview = interview
    // Initializing all the custom data types
    this.loadBlueprintAndCreateIndexes(blueprint)
    this.data = new DataStore()
    this.actions = new ActionStore(this.blueprint)

    if (data) this.data.loadData(data)
    if (conditionTags) this.data.loadConditionTags(conditionTags)
    if (respondentFills) this.respondentFills.fill(respondentFills)
    if (actions) this.actions.load(actions)

    this.navigator = new InterviewNavigator(this)

  }

  attachDataPersistSlave () {
    this._dataPersistSlave = dataPersistSlave(this.interview.id, this.data)
  }

  attachActionsPersistSlave () {
    this._actionsPersistSlave = actionsPersistSlave(this.interview.id, this.actions)
  }

  /**
   * Run anything that needs to wait until other stuff is initialized before being run
   */
  initialize () {
    debugger
    this.actions.initialize() // This emits an initial state event to any subscribers (the actionsPersistSlave)
    this.data.initialize()    // This emits an initial state event to any subscribers (the dataPersistSlave)
    this.data.reset()
    this.initializeConditionAssignment()
    this.onFirstPage()
    this.playActions(this.actions.actions)
  }

  /**
   * Make sure all data is stored (if any)
   * @returns {Promise<[any]>}
   */
  save () {
    let p = []
    if (this._dataPersistSlave) {
      p.push(this._dataPersistSlave.save())
    }
    if (this._actionsPersistSlave) {
      p.push(this._actionsPersistSlave.save())
    }
    return Promise.all(p)
  }

  /**
   * Should be called when you want to cleanup the interview
   */
  destroy () {
    if (this._dataPersistSlave) {
      this._dataPersistSlave.destroy()
      this._dataPersistSlave = null
    }
    if (this._actionsPersistSlave) {
      this._actionsPersistSlave.destroy()
      this._actionsPersistSlave = null
    }
    this.navigator.destroy()
    this._resetState()
  }

  /**
   * Make the location zero
   * @private
   */
  _zeroLocation () {
    this.navigator.zero()
  }

  /**
   * Empty the state
   */
  _resetState () {
    this.data.reset()
    this.makePageQuestionDatum(this.location.section, this.location.page)
  }

  /**
   * Play an array of actions
   * @param {Action[]} actions - The array of actions to play
   */
  playActions (actions: Action[]) {
    const locationMatches = action => {
      return this.actions.getActionSection(action) === this.location.section &&
        this.actions.getActionPage(action) === this.location.page &&
        action.sectionRepetition === this.location.sectionRepetition &&
        action.sectionFollowUpRepetition === this.location.sectionFollowUpRepetition
    }
    for (let action of actions) {
      if (action.actionType !== 'next' && action.actionType !== 'previous') {
        let matches = locationMatches(action)
        if (matches) {
          this.performAction(action)
        } else {
          this.next()
          if (locationMatches(action)) {
            this.performAction(action)
          } else {
            console.warn('action order does not line up with order of the form')
            // debugger
          }
        }
      }
    }
  }

  /**
   * All user created actions should go through this method so that the actions are stored
   * @param {Action} action - The action without location information
   */
  pushAction (action: Action) {
    action.interviewId = this.interview.id
    this.actions.add(action, this.location)
    this.performAction(action, true)
  }

  /**
   * This method actually modifies the state based on the action type and payload
   * @param {Action} action
   * @param {Boolean} [actionWasInitiatedByAHuman = false]
   */
  performAction (action: Action, actionWasInitiatedByAHuman: boolean = false) {
    let questionDatum = null
    let questionBlueprint = null
    if (action.questionId) {
      let followUpQuestionId = this.questionIdToSectionIndex.get(action.questionId).followUpQuestionId
      let actionFollowUpDatumId = this.navigator.getFollowUpQuestionDatumIdByFollowUpRepetition(followUpQuestionId, action.sectionFollowUpRepetition)
      questionDatum = this.data.getSingleQuestionDatumByLocation(action.questionId, action.sectionRepetition, actionFollowUpDatumId)
      questionBlueprint = this.findQuestionBlueprint(action.questionId)
    } else if (action.actionType !== 'next' && action.actionType !== 'previous') {
      console.error(action)
      throw new Error('Only next and previous action types are allowed to not be associated with a question datum id')
    }
    actionManager.do(action, this, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
  }

  /**
   *
   */
  private onFirstPage (): void {
    this.onPageEnter()
    if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
      debugger
      this.next()
    }
  }

  /**
   * Called when the leaving any page. Includes skipped pages
   * @private
   */
  private onPageExit () {
    this._evaluateConditionAssignment()
  }

  /**
   * Called when entering any page. Includes skipped pages
   * @private
   */
  private onPageEnter () {
    // let actions = this.actions.getLocationActions(this.location)
    this.makePageQuestionDatum(this.location.section, this.location.page)
  }

  /**
   * Use the skip service to check if we should skip the supplied page
   * @param {number} section
   * @param {number} sectionRepetition
   * @param {string} sectionFollowUpDatumId
   * @param {number} pageIndex
   * @returns {boolean}
   */
  private shouldSkipPage (section: number, sectionRepetition: number, sectionFollowUpDatumId: string, pageIndex: number): boolean {
    // Get assigned condition tags and convert them into a set of condition ids
    const conditionTagNames = this.getConditionTagSet(sectionRepetition, sectionFollowUpDatumId)
    const page = this.getPage(section, pageIndex)
    return SkipService.shouldSkipPage(page.skips, conditionTagNames)
  }

  nextAndReplay () {
    this.next()
    // this.replayToCurrent()
  }

  previousAndReplay () {
    this.previous()
    // this.replayToCurrent()
  }

  /**
   * Move to the next valid page in the survey. The bulk of the form navigation is handled by the clock class which is
   * an abstraction on this type of incremental movement that is similar to a clock
   * @returns undefined
   */
  next () {
    // Don't increment if we're already at the end
    if (this.navigator.isAtEnd) {
      return this.atEnd()
    }
    this.onPageExit()
    this.navigator.next()
    this.onPageEnter()

    // Skip any question that's in a follow up section with no data to follow up on
    if (this.currentSection.followUpQuestionId && this.navigator.clock.clockMax[2] < 0) {
      console.log('skipping question in empty follow up section', JSON.stringify(this.location))
      return this.next()
    }

    if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
      console.log('skipping location', JSON.stringify(this.location))
      this._markAsSkipped()
      return this.next()
    }
    console.log('next done location', JSON.stringify(this.location))
  }

  previous () {
    // Don't decrement if we're already at the beginning
    if (this.navigator.isAtStart) {
      return this.atBeginning()
    }
    this.onPageExit()
    this.navigator.previous()
    this.onPageEnter()

    // Skip any question that's in a follow up section with no data to follow up on
    if (this.currentSection.followUpQuestionId && this.navigator.clock.clockMax[2] < 0) {
      console.log('skipping question in empty follow up section', JSON.stringify(this.location))
      return this.previous()
    }

    if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
      console.log('skipping location', JSON.stringify(this.location))
      this._markAsSkipped()
      return this.previous()
    }
    console.log('previous done location', JSON.stringify(this.location))
  }

  replayToCurrent () {
    this.replayTo(this.location.section, this.location.page, this.location.sectionRepetition, this.location.sectionFollowUpRepetition)
  }

  /**
   * Zero the state of the survey and replay all of the actions that have happened in the survey so far. The order of the
   * action replay follows the order of the survey as opposed to the order that the actions happened in. Once all actions
   * have been replayed we seek to the specified location in the survey
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   */
  replayTo (section: number, page: number, sectionRepetition: number, sectionFollowUpRepetition: number) {
    this._isReplaying = true
    this._zeroLocation()
    this._resetState()
    this.playActions(this.actions.actions)

    this.seekTo(section, page, sectionRepetition, sectionFollowUpRepetition)
    this._isReplaying = false
  }

  /**
   * Seek to a specific location in the survey
   * @param {number} section
   * @param {number} sectionRepetition
   * @param {number} sectionFollowUpRepetition
   * @param {number} page
   */
  seekTo (section: number, sectionRepetition: number, sectionFollowUpRepetition: number, page: number) {
    let count = 1
    let DIRS = {FORWARD: 0, BACKWARD: 1}
    // Cast the current location and desired location into a 4 digit number with this structure {section}{sectionRepetition}{sectionFollowUpRepetition}{page}
    let desiredLocNumber = section * 1000000 + sectionRepetition * 10000 + sectionFollowUpRepetition * 100 + page
    let curLocNumber
    let previousDirection
    let currentDirection
    do {
      curLocNumber = this.location.section * 1000000 + this.location.sectionRepetition * 10000 + this.location.sectionFollowUpRepetition * 100 + this.location.page
      if (curLocNumber < desiredLocNumber) {
        currentDirection = DIRS.FORWARD
      } else if (curLocNumber > desiredLocNumber) {
        currentDirection = DIRS.BACKWARD
      } else {
        console.log(`The desired survey location has been reached already`)
        return
      }

      // Detect if we're switching directions. This should never happen, but we should leave the loop if it does
      if (previousDirection !== undefined && previousDirection !== null && currentDirection !== previousDirection) {
        console.error(`We are switching directions during the seek. Unreachable seek location detected: 
          section: ${section}, page: ${page}, sectionRepetition: ${sectionRepetition}, sectionFollowUpRepetition: ${sectionFollowUpRepetition}`)
        return
      }
      previousDirection = currentDirection

      // Actually move in the specified direction
      switch (currentDirection) {
        case DIRS.FORWARD:
          this.next()
          break
        case DIRS.BACKWARD:
          this.previous()
          break
        default:
          return
      }

      if (count > 1000) {
        throw Error('Infinite loop when trying to seek to survey location. Please check exit conditions')
      }
      count++
    } while (curLocNumber !== desiredLocNumber)
  }

  /**
   * Mark all current questions as skipped. This is stored as a property on the questionDatum
   * @private
   */
  _markAsSkipped () {
    // TODO: Mark all questions on the current page as skipped
    console.log('Skipped ', this.location)
  }

  /**
   * Handle the 'already at the beginning of survey' event
   */
  atBeginning () {
    if (!this._isReplaying) {
      this.emit('atBeginning', JSON.parse(JSON.stringify(this.location)))
    }
    console.log(`Reached the beginning of the survey`)
  }

  /**
   * Handle 'reached the end of survey' event
   */
  atEnd () {
    if (!this._isReplaying) {
      this.onPageExit()
      this.emit('atEnd', JSON.parse(JSON.stringify(this.location)))
    }
    console.log(`Reached the end of the survey`)
  }



  /**
   * Returns the value for a respondent fill with the specified varName
   * @param {string} varName
   * @returns {any}
   */
  getRespondentFillByVarName (varName: string) {
    return this.respondentFills.get(varName)
  }

  /**
   * Get a question datum by the question var name. There should only be one per question per repetition
   * @param {String} varName
   * @param {Number} sectionFollowUpRepetition
   * @returns {Object}
   */
  getSingleDatumByQuestionVarName (varName: string, sectionFollowUpRepetition: number): QuestionDatum {
    let questionId = this.varNameIndex.get(varName)
    if (!questionId) {
      throw Error(`No question matches the var_name, ${varName}. Are you sure you spelled it correctly?`)
    }
    console.log('Getting question by varname', varName, sectionFollowUpRepetition)
    let questionDatum = this.data.getQuestionDataByQuestionId(questionId) || []
    debugger
    for (let qD of questionDatum) {
      if (qD.data.findIndex(d => d.eventOrder === sectionFollowUpRepetition) > -1) {
        return qD
      }
    }
    throw Error(`No question datum matches the var_name, ${varName}. Does it appear later in the survey?`)
  }




  /**
   * Alias for follow up question datum for the current state of the survey
   * @returns {T}
   */
  getCurrentFollowUpQuestionDatum () {
    return this.getFollowUpQuestionDatumData(this.location.sectionFollowUpDatumId)
  }

  /**
   * Make a copy of the current interview
   * @returns {Interview}
   */
  copy () {
    return new InterviewManager(this.interview.copy(), this.blueprint.copy(), [], this.data.copy())
  }
}

let sharedInterviewInstance = null
export function sharedInterview (interview: Interview,
                                 blueprint: Form,
                                 actions?: Action[],
                                 data?: QuestionDatum[],
                                 conditionTags?: ConditionTagInterface,
                                 respondentFills?: RespondentFill[]) {
  if (!sharedInterviewInstance) {
    sharedInterviewInstance = new InterviewManager(interview, blueprint, actions, data, conditionTags, respondentFills)
  }
  return sharedInterviewInstance
}

export function clearSharedInterview () {
  if (sharedInterviewInstance) {
    sharedInterviewInstance.destroy()
  }
  sharedInterviewInstance = null
}
