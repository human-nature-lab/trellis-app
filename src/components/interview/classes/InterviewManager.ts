import SkipService from '../services/SkipService'
import actionManager from '../services/actions/InterviewActionDefinitions'
import ActionStore from './ActionStore'
import DataStore from './DataStore'
import dataPersistSlave from '../services/DataPersistSlave'
import actionsPersistSlave from '../services/ActionsPersistSlave'
import AT from '../../../static/action.types'

import InterviewNavigator, {InterviewLocation} from '../services/InterviewNavigator'
import Form from '../../../entities/trellis/Form'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Action from '../../../entities/trellis/Action'
import ConditionTagInterface from '../../../services/condition-tag/ConditionTagInterface'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Interview from '../../../entities/trellis/Interview'
import InterviewManagerBase from "./InterviewManagerBase";
import ImmutableQueue from "../../../classes/ImmutableQueue";


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
    this.actions.initialize() // This emits an initial state event to any subscribers (the actionsPersistSlave)
    this.data.initialize()    // This emits an initial state event to any subscribers (the dataPersistSlave)
    this.data.reset()
    this.initializeConditionAssignment()
    this.onFirstPage()
    debugger
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
    for (let action of actions) {
      if (action.actionType !== 'next' && action.actionType !== 'previous') {
        let matches = this.actions.matchesLocation(action, this.location)
        if (matches) {
          this.performAction(action)
        } else {
          this.next()
          if (this.actions.matchesLocation(action, this.location)) {
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
      this.stepForward()
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

  next () {
    this.stepForward()
    this.replayToCurrent()
  }

  previous () {
    this.stepBackward()
    this.replayToCurrent()
  }

  /**
   * Move to the next valid page in the survey. The bulk of the form navigation is handled by the clock class which is
   * an abstraction on this type of incremental movement that is similar to a clock
   * @returns undefined
   */
  stepForward () {
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
      return this.stepForward()
    }

    if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
      this._markAsSkipped()
      return this.stepForward()
    }
    console.log('next done location', JSON.stringify(this.location))
  }

  stepBackward () {
    // Don't decrement if we're already at the beginning
    if (this.navigator.isAtStart) {
      return this.atBeginning()
    }
    // this.onPageExit() // Don't assign conditions on the way backward
    this.navigator.previous()
    this.onPageEnter()

    // Skip any question that's in a follow up section with no data to follow up on
    if (this.currentSection.followUpQuestionId && this.navigator.clock.clockMax[2] < 0) {
      console.log('skipping question in empty follow up section', JSON.stringify(this.location))
      return this.stepBackward()
    }

    if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
      this._markAsSkipped()
      return this.stepBackward()
    }
    console.log('previous done location', JSON.stringify(this.location))
  }

  replayToCurrent (): void {
    this.replayTo(this.location.section, this.location.page, this.location.sectionRepetition, this.location.sectionFollowUpRepetition)
  }

  locToNumber (loc: InterviewLocation): number {
    return Math.pow(100, 4) * (loc.section || 0) + Math.pow(100, 3) * (loc.sectionRepetition || 0) + Math.pow(100, 2) * (loc.sectionFollowUpRepetition || 0) + (loc.page || 0)
  }

  actionToLocationNumber (action: Action): number {
    return this.locToNumber({
      section: this.questionIdToSectionNum.get(action.questionId),
      sectionRepetition: action.sectionRepetition,
      sectionFollowUpRepetition: action.sectionFollowUpRepetition,
      page: this.questionIdToPageNum.get(action.questionId)
    })
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
    // TODO: Verify that location is zeroed correctly
    this._zeroLocation()
    // TODO: Check that state is reset correctly
    this._resetState()
    // TODO: Verify that actions are ordered correctly
    const actionQueue = new ImmutableQueue(this.actions.actions.filter(a => a.actionType !== AT.next && a.actionType !== AT.previous))
    let action = actionQueue.next()
    const nextActionCount = this.actions.actions.reduce((c, a) => a.actionType === AT.next ? c + 1 : c, 0)
    let numPagesReplayed = 0
    function currentLocationHasValidResponses (): boolean {
      // TODO
      return true
    }
    while (action) {
      // console.log('action', action)
      // Check if we have a valid question id and skip it the action if we don't
      if (!this.questionIndex.has(action.questionId)) continue

      let actionLocation = this.actionToLocationNumber(action)
      let currentLocation = this.locToNumber(this.location)
      if (actionLocation === currentLocation) {
        this.performAction(action)
      } else {
        actionLocation = this.actionToLocationNumber(action)
        let currentLocation = this.locToNumber(this.location)
        let c = 0
        // TODO: Double check for invalid action location???
        while (currentLocation < actionLocation && currentLocationHasValidResponses() && c < 100) {
          this.stepForward()
          numPagesReplayed++
          currentLocation = this.locToNumber(this.location)
          if (actionLocation === currentLocation) {
            try {
              this.performAction(action)
            } catch (err) {
              console.error(err)
              debugger
            }
          }
          c++
        }
        if (c > 3) {
          console.log('Skipped through more than 3 pages of questions')
          debugger
        }
      }
      action = actionQueue.next()
    }
    if (nextActionCount > numPagesReplayed) {
      this.stepForward()
    }
    let currentLocNumber = this.locToNumber(this.location)
    const desiredLocNumber = this.locToNumber({section, sectionRepetition, sectionFollowUpRepetition, page})
    if (desiredLocNumber === currentLocNumber) {
      // Do nothing here if we're already there
    } else if (desiredLocNumber > currentLocNumber) {
      // Iterate forward through optional and readOnly pages until we hit the page we want to reach
      let c = 0
      do {
        this.stepForward()
        currentLocNumber = this.locToNumber(this.location)
        c++
      } while(desiredLocNumber > currentLocNumber && currentLocationHasValidResponses() && c < 100)
      if (c > 10) {
        console.log(`moved forward ${c} steps`)
        debugger
      }
      // this.seekTo(section, sectionRepetition, sectionFollowUpRepetition, page)
      console.log('post seek', JSON.parse(JSON.stringify(this.data.data)))
    } else {
      let c = 0
      do {
        this.stepBackward()
        currentLocNumber = this.locToNumber(this.location)
        c++
      } while (desiredLocNumber < currentLocNumber && currentLocationHasValidResponses() && c < 100)
      // this.navigator.setLocationNumber(section, sectionRepetition, sectionFollowUpRepetition, page)
    }
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
    let desiredLocNumber = this.locToNumber({section, sectionRepetition, sectionFollowUpRepetition, page})
    let curLocNumber
    let previousDirection
    let currentDirection
    do {
      curLocNumber = this.locToNumber(this.location)
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
          this.stepForward()
          break
        case DIRS.BACKWARD:
          this.stepBackward()
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
    // console.log('Skipped ', JSON.stringify(this.location))
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
    for (let qD of questionDatum) {
      if (qD.data.findIndex(d => d.eventOrder === sectionFollowUpRepetition) > -1) {
        return qD
      }
    }
    throw Error(`No question datum matches the var_name, ${varName}. Does it appear later in the survey?`)
  }

  /**
   * Return the questions for teh current location
   * @returns {Question[]}
   */
  getCurrentPageQuestions () {
    return this.getPageQuestions(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)
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
