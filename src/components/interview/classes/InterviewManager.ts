import SkipService from '../../../services/SkipService'
import actionManager from '../services/actions/InterviewActionDefinitions'
import ActionStore from './ActionStore'
import DataStore from './DataStore'
import dataPersistSlave from '../services/DataPersistSlave'
import actionsPersistSlave from '../services/ActionsPersistSlave'
import AT from '../../../static/action.types'

import {InterviewLocation} from '../services/InterviewNavigator'
import Form from '../../../entities/trellis/Form'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Action from '../../../entities/trellis/Action'
import ConditionTagInterface from '../../../services/condition-tag/ConditionTagInterface'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Interview from '../../../entities/trellis/Interview'
import InterviewManagerBase from "./InterviewManagerBase";
import ImmutableQueue from "../../../classes/ImmutableQueue";
import Question from "../../../entities/trellis/Question";
import QT from '../../../static/question.types'
import PT from '../../../static/parameter.types'
import {locToNumber} from "../services/LocationHelpers";
import InterviewAlligator from "../services/InterviewAlligator";

export default class InterviewManager extends InterviewManagerBase {

  private _isReplaying: boolean
  public _debugReplay: boolean = false

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

    this.navigator = new InterviewAlligator(this)

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
    this.navigator.initialize()
    this.onFirstPage()
    this.playAllActions()
    this.seekToInitialLocation()
  }

  /**
   * Make sure all data is stored (if any)
   * @returns {Promise<[any]>}
   */
  save () {
    // TODO: Replay all actions and assign all conditions here
    this.playAllActions()
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
    // this.navigator.destroy()
  }

  /**
   * Make the location zero
   * @private
   */
  _zeroLocation () {
    this.navigator.zero()
  }

  get location (): InterviewLocation {
    return this.navigator.loc
  }

  /**
   * Empty the state
   */
  _resetState () {
    this.data.reset()
    const location = this.navigator.loc
    this.makePageQuestionDatum(location.section, location.page)
  }

  /**
   * All user created actions should go through this method so that the actions are stored
   * @param {Action} action - The action without location information
   */
  pushAction (action: Action) {
    action.interviewId = this.interview.id
    this.actions.add(action, this.navigator.loc)
    this.performAction(action, true)
  }

  /**
   * This method actually modifies the state based on the action type and payload
   * @param {Action} action
   * @param {Boolean} [actionWasInitiatedByAHuman = false]
   */
  performAction (action: Action, actionWasInitiatedByAHuman: boolean = false) {
    let questionDatum: QuestionDatum = null
    let questionBlueprint: Question = null
    if (action.questionId) {
      // let followUpQuestionId = this.questionIdToSectionIndex.get(action.questionId).followUpQuestionId
      questionDatum = this.navigator.getActionQuestionDatum(action)
      // let actionFollowUpDatumId = this.navigator.getFollowUpQuestionDatumIdByFollowUpRepetition(followUpQuestionId, action.sectionFollowUpRepetition)
      // questionDatum = this.data.getSingleQuestionDatumByLocation(action.questionId, action.sectionRepetition, actionFollowUpDatumId)
      questionBlueprint = this.questionIndex.get(action.questionId)
      if (!questionDatum) {
        debugger
      }
      this.data.emitChange()
    } else if (action.actionType !== 'next' && action.actionType !== 'previous') {
      console.error(action)
      throw new Error('Only next and previous action types are allowed to not be associated with a question datum id')
    }
    actionManager.do(action, this, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
  }

  private onFirstPage (): void {
    this.onPageEnter()
    // if (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)) {
    //   this.stepForward()
    // }
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
    this.makePageQuestionDatum(this.navigator.loc.section, this.navigator.loc.page)
  }

  next () {
    if (this._debugReplay) debugger
    // console.log('pre replay location', this.location)
    this.replayToCurrent()
    // this.data.emitChange()
    // console.log('post replay location', this.location)
    this.stepForward()
    // console.log('post step location', this.location)
  }

  previous () {
    if (this._debugReplay) debugger
    this.stepBackward()
    this.replayToCurrent()
  }

  stepForward (): boolean {
    this.onPageExit()
    if (this.navigator.isAtEnd) {
      this.atEnd()
      return false
    }
    this.navigator.next()
    this.onPageEnter()
    return true
  }

  stepBackward (): boolean {
    if (this.navigator.isAtStart) {
      this.atBeginning()
      return false
    }
    // this.onPageExit() // Don't assign conditions on the way backward
    this.navigator.previous()
    this.onPageEnter()
    return true
  }

  replayToCurrent (): void {
    const loc = JSON.parse(JSON.stringify(this.location))
    this.replayTo(loc.section, loc.page, loc.sectionRepetition, loc.sectionFollowUpRepetition)
  }

  /**
   * Returns true if the current location has all of the required responses
   * @returns {boolean}
   */
  currentLocationHasValidResponses (): boolean {
    const questions = this.getCurrentPageQuestions()
    function toBoolean (val: string|boolean|number): boolean {
      if (typeof val === 'boolean') {
        return val
      } else if (typeof val === 'number') {
        return !!val
      } else {
        return val === '1' || val === 'true'
      }
    }
    function isValid (question: Question): boolean {
      let isIntro = question.questionTypeId === QT.intro
      let isReadOnly = false
      let isRequired = true
      for (let parameter of question.questionParameters) {
        if (parameter.parameterId === PT.read_only.toString(10) && toBoolean(parameter.val)) {
          isReadOnly = true
        } else if (parameter.parameterId === PT.is_required.toString(10) && !toBoolean(parameter.val)) {
          isRequired = false
        }
      }
      if (isIntro) {
        return true
      } else if (isReadOnly) {
        return true
      } else if (isRequired) {
        // TODO: Check if dkRf are allowed
        if (question.datum.dkRf !== null && question.datum.dkRf !== undefined && question.datum.dkRfVal && question.datum.dkRfVal.length) {
          return true
        } else {
          // TODO: Maybe actually validate responses as well???
          return question.datum.data.length > 0
        }
      }
    }
    for (let question of questions) {
      if (!isValid(question)) {
        return false
      }
    }
    return true
  }

  /**
   * Rebuild the state of the survey by zeroing the location and resetting the data before replaying all actions.
   * Returns an InterviewLocation if we found invalid sections of the survey
   */
  playAllActions (): InterviewLocation {
    this._isReplaying = true
    // TODO: Verify that location is zeroed correctly
    this._zeroLocation()
    // TODO: Check that state is reset correctly
    // let conditionTags = this.data.getAllConditionTagsForLocation(this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
    // console.log('initialState', JSON.parse(JSON.stringify(this.data.data)), JSON.parse(JSON.stringify(this.data.conditionTags)), conditionTags.map(c => c.id), conditionTags.map(c => c.name))
    this._resetState()
    // conditionTags = this.data.getAllConditionTagsForLocation(this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
    // console.log('resetState', JSON.parse(JSON.stringify(this.data.data)), JSON.parse(JSON.stringify(this.data.conditionTags)), conditionTags.map(c => c.id), conditionTags.map(c => c.name))
    // TODO: Verify that location is zeroed correctly
    this._zeroLocation()
    // TODO: Verify that actions are ordered correctly
    const actionQueue = new ImmutableQueue(this.actions.actions.filter(a => a.actionType !== AT.next && a.actionType !== AT.previous))
    let action = actionQueue.next()
    const nextActionCount = this.actions.actions.reduce((c, a) => a.actionType === AT.next ? c + 1 : c, 0)
    let foundInvalidActions = false
    let nPagesPassed = 1
    let c = 0
    while (action && c < 1000) {
      c++
      // Check if we have a valid question id and skip it the action if we don't
      if (!this.questionIndex.has(action.questionId)) {
        console.log('invalid action question id', action)
        continue
      }

      let actionLocation = this.actions.actionToLocation(action)
      if (this.navigator.locationsAreNumericallyTheSame(actionLocation, this.navigator.loc)) {
        // console.log('performing action', action, this.navigator.loc)
        this.performAction(action)
        action = actionQueue.next()
      } else if (this.navigator.locationIsAheadOfCurrent(actionLocation) && this.currentLocationHasValidResponses()) {
        // console.log('action moving forward', action, this.navigator.loc)
        this.stepForward()
        nPagesPassed++
      } else {
        // console.log('skipping invalid action', action, this.currentLocationHasValidResponses())
        foundInvalidActions = true
        action = actionQueue.next()
      }
    }
    if (c >= 1000) {
      debugger
    }
    // Go as far as possible through the survey
    while (this.currentLocationHasValidResponses() && this.stepForward()) {}
    // conditionTags = this.data.getAllConditionTagsForLocation(this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
    // console.log('postReplayState', JSON.parse(JSON.stringify(this.data.data)), JSON.parse(JSON.stringify(this.data.conditionTags)), conditionTags.map(c => c.id), conditionTags.map(c => c.name))
    this._isReplaying = false
    return foundInvalidActions ? this.location : null
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
    this.playAllActions()
    // console.log('desired location', {section, page, sectionRepetition, sectionFollowUpRepetition})
    let currentLoc = locToNumber(this.navigator.loc)
    const desiredLoc = locToNumber({section, page, sectionRepetition, sectionFollowUpRepetition})
    if (currentLoc < desiredLoc) {
      let c
      for (c = 0; c < 100; c++) {
        currentLoc = locToNumber(this.navigator.loc)
        if (currentLoc >= desiredLoc || !this.currentLocationHasValidResponses() || !this.stepForward()) {
          break
        }
      }
      if (c > 10) {
        console.error(`passed through ${c} pages`)
        debugger
      }
    } else {
      this.navigator.seekTo({section, sectionRepetition, sectionFollowUpRepetition, page})
    }
  }

  /**
   * Seek through the survey to the last recorded action
   */
  seekToInitialLocation (): void {
    const lastRealAction = this.actions.lastRealAction
    if (lastRealAction) {
      const lastLocation = this.actions.actionToLocation(lastRealAction)
      while (this.currentLocationHasValidResponses() && this.navigator.locationIsAheadOfCurrent(lastLocation) && this.stepForward());
    } else {
      this.navigator.seekTo({section: 0, page: 0, sectionRepetition: 0, sectionFollowUpRepetition: 0})
    }
  }

  /**
   * Mark all current questions as skipped. This is stored as a property on the questionDatum
   * @private
   */
  _markAsSkipped () {
    // TODO: Mark all questions on the current page as skipped
    // console.log('Skipped ', JSON.parse(JSON.stringify(this.location)))
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
    this.onPageExit()
    if (!this._isReplaying) {
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
