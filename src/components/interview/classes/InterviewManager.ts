import uuidv4 from 'uuid/v4'
import actionManager from '../services/actions/InterviewActionDefinitions'
import validateParameters from '../services/ValidatorService'
import ActionStore from './ActionStore'
import DataStore from './DataStore'
import AT from '../../../static/action.types'

import { InterviewLocation } from '../services/InterviewAlligator'
import Form from '../../../entities/trellis/Form'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Action from '../../../entities/trellis/Action'
import { ConditionTagInterface } from '../../../services/interview/InterviewDataInterface'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Interview from '../../../entities/trellis/Interview'
import InterviewManagerBase from './InterviewManagerBase'
import Question from '../../../entities/trellis/Question'
import QT from '../../../static/question.types'
import PT from '../../../static/parameter.types'
import { locToNumber } from '../services/LocationHelpers'
import InterviewAlligator from '../services/InterviewAlligator'
import RespondentConditionTag from '../../../entities/trellis/RespondentConditionTag'
import Section from '../../../entities/trellis/Section'

export default class InterviewManager extends InterviewManagerBase {

  private _isReplaying: boolean
  private hasAddedActions: boolean = false
  private lastActionHasChanged: boolean = false
  private lastAction: Action = null
  private isNavigating: boolean = false
  private highWaterMark: number = 0       // A record of the furthest point reached in the survey so far

  constructor (
    interview: Interview,
    blueprint: Form,
    actions?: Action[],
    data?: QuestionDatum[],
    conditionTags?: ConditionTagInterface,
    respondentFills?: RespondentFill[],
    baseRespondentConditionTags?: RespondentConditionTag[]
  ) {
    super()

    // Indexes and data stores
    this.interview = interview
    // Initializing all the custom data types
    this.loadBlueprintAndCreateIndexes(blueprint)
    this.data = new DataStore()
    this.actions = new ActionStore(this.blueprint)

    console.log('InterviewManager: initial data', data)
    if (data) this.data.loadData(data)
    if (conditionTags) this.data.loadConditionTags(conditionTags, baseRespondentConditionTags)
    if (respondentFills) this.respondentFills.fill(respondentFills)
    if (actions) this.actions.load(actions)

    this.navigator = new InterviewAlligator(this)

  }

  /**
   * Run anything that needs to wait until other stuff is initialized before being run
   */
  async initialize () {
    console.log('Initial condition tags', this.data.conditionTags)
    this.actions.initialize() // This emits an initial state event to any subscribers (the actionsPersistSlave)
    this.data.initialize()    // This emits an initial state event to any subscribers (the dataPersistSlave)
    this.data.reset()
    this.initializeConditionAssignment()
    this.navigator.initialize()
    this.onFirstPage()
    this.playAllActions()
    this.seekToInitialLocation()
    await this.save()
  }

  /**
   * Make sure all data is stored (if any)
   * @returns {Promise<[any]>}
   */
  finalSave (): Promise<any> {
    if (!this.actions.store.length || !this.data.data.length) {
      console.log('nothing to finalSave')
      return new Promise(resolve => setTimeout(resolve))
    }
    this.playAllActions()
    return this.save()
  }

  /**
   * Store all of the data to disk
   * @returns {Promise<[any]>}
   */
  async save (): Promise<void> {
    if (this.shouldSaveActions) {
      try {
        await this.actions.save(this.interview.id)
      } catch (err) {
        this.emit('error', {
          msg: 'Failed to save actions',
          err
        })
        throw err
      }
    }
    if (this.shouldSaveData) {
      try {
        await this.data.save(this.interview.id)
      } catch (err) {
        this.emit('error', {
          msg: 'Failed to save data',
          err
        })
        throw err
      }
    }

    // await new Promise(resolve => setTimeout(resolve, 2000))
  }

  /**
   * Should be called when you want to cleanup the interview
   */
  destroy () {
    // this.navigator.destroy()
    this.removeListeners()
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
    // Drop any actions that are sent during an active navigation. This is necessary to catch actions which are sent before the UI can be disabled.
    if (this.isNavigating) {
      console.log('Dropping action which occurred mid navigation', action)
      return
    }
    if (!action.id) {
      action.id = uuidv4()
    }
    action.interviewId = this.interview.id
    let followUpActionId
    if (action.actionType !== AT.next && action.actionType !== AT.previous && this.navigator.loc.sectionFollowUpDatumId) {
      followUpActionId = this.data.getFollowUpActionId(action.questionId, this.navigator.loc.sectionFollowUpDatumId, this.navigator.loc.sectionRepetition)
    }
    this.actions.add(action, followUpActionId, this.navigator.loc.sectionRepetition)
    if (action.actionType !== AT.next && action.actionType !== AT.previous) {
      this.hasAddedActions = true
      this.lastAction = action
      this.lastActionHasChanged = true
    }
    return this.performAction(action, true)
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
      questionDatum = this.navigator.getActionQuestionDatum(action)
      if (!questionDatum) {
        debugger
      }
      questionBlueprint = this.questionIndex.get(action.questionId)
      if (!questionBlueprint) {
        debugger
      }
    } else if (action.actionType !== 'next' && action.actionType !== 'previous') {
      console.error(action)
      throw new Error('Only next and previous action types are allowed to not be associated with a question datum id')
    }
    return actionManager.do(action, this, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
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
    // Remove any datum if they have responded with dk/rf
    const questions = this.questionsWithData()
    for (let question of questions) {
      if (question.datum.dkRf != null) {
        console.log('dkRf found. Removing data for question', question.id)
        this.data.removeAllDatum(question.datum)
      } else if (question.datum.dkRf === null) {
        question.datum.dkRfVal = null
      }
    }
    this._evaluateConditionAssignment()
  }

  /**
   * Called when entering any page. Includes skipped pages
   * @private
   */
  private onPageEnter () {
    this.makePageQuestionDatum(this.navigator.loc.section, this.navigator.loc.page)
  }

  private get isAtHighWaterMark (): boolean {
    return locToNumber(this.navigator.loc) === this.highWaterMark
  }

  private updateHighWaterMark () {
    const locNum = locToNumber(this.navigator.loc)
    if (locNum > this.highWaterMark) {
      this.highWaterMark = locNum
    }
  }

  private resetHighWaterMark () {
    this.highWaterMark = 0
  }

  async next () {
    if (this.isNavigating) {
      throw Error('next: Already navigating')
    }
    this.isNavigating = true
    this.navigator.updatePagesCalled = 0
    if (this.hasAddedActions && !this.isAtHighWaterMark) {
      // We aren't at the end of the survey and we made changes. Replay the all actions to rebuild the state before moving forward.
      this.resetHighWaterMark()
      this.replayToCurrent()
      this.stepForward(false)
    } else if (this.isAtHighWaterMark && this.lastAction) {
      // We are at the end of the survey and we made changes. Play all valid actions ahead of this point in the survey and then move back to the correct page.
      if (this.stepForward()) {
        // Only play actions and move forward if we haven't already reached the end of the survey
        const loc = JSON.parse(JSON.stringify(this.location))
        this.playActionsAndMoveForward()
        this.seek(loc.section, loc.page, loc.sectionRepetition, loc.sectionFollowUpRepetition)
      }
      this.lastActionHasChanged = false
    } else {
      // No actions have been added so we just move to the next page
      this.stepForward(false)
    }
    await this.save()
    this.hasAddedActions = false
    this.isNavigating = false
  }

  async previous () {
    if (this.isNavigating) {
      throw Error('previous: Already navigating')
    }
    this.isNavigating = true
    this.navigator.updatePagesCalled = 0
    this.stepBackward()
    await this.save()
    this.isNavigating = false
  }

  stepForward (dataHasChanged: boolean = true): boolean {
    if (dataHasChanged) this.onPageExit()
    if (this.navigator.isAtEnd) {
      this.atEnd()
      return false
    }
    this.navigator.next()
    if (dataHasChanged) {
      this.onPageEnter()
    }
    this.updateHighWaterMark()
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
      if (isIntro || isReadOnly || !isRequired) {
        return true
      } else if (isRequired) {
        // TODO: Check if dkRf are allowed
        if (question.datum.dkRf !== null && question.datum.dkRf !== undefined && question.datum.dkRfVal && question.datum.dkRfVal.length) {
          return true
        } else if (question.datum.noOne) {
          return true
        } else {
          return validateParameters(question, question.questionParameters, question.datum) === true
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

  private playPageActions (): boolean {
    const pageQuestions = this.getCurrentPageQuestions()
    const pageActions = pageQuestions.reduce((actions, q) => {
      const section: Section = this.questionIdToSectionIndex.get(q.id)
      let followUpActionId
      let repetition
      if (section.followUpQuestionId) {
        followUpActionId = this.data.getFollowUpActionId(q.id, this.location.sectionFollowUpDatumId, this.location.sectionRepetition)
      }
      if (section.isRepeatable) {
        repetition = this.location.sectionRepetition
      }
      const questionActions = this.actions.getQuestionActions(q.id, followUpActionId, repetition)
      return questionActions ? actions.concat(questionActions) : actions
    }, [] as Action[])

    // if (pageQuestions.length && !pageActions.length) return false

    for (let action of pageActions) {
      this.performAction(action, false)
    }

    return true
  }

  private playActionsAndMoveForward () {
    this._isReplaying = true
    let c = 0
    let keepMoving = true
    while (keepMoving && c < 1000) {
      keepMoving = this.playPageActions() && this.currentLocationHasValidResponses() && this.stepForward()
      c++
    }
    this._isReplaying = false
  }

  /**
   * Rebuild the state of the survey by zeroing the location and resetting the data before replaying all actions.
   * Returns an InterviewLocation if we found invalid sections of the survey
   */
  private playAllActions () {
    this._zeroLocation()
    this._resetState()
    this._zeroLocation()
    this.playActionsAndMoveForward()
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
    this.seek(section, page, sectionRepetition, sectionFollowUpRepetition)
  }

  /**
   * Seek to a particular location in the form without changing the data
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   */
  seek (section: number, page: number, sectionRepetition: number, sectionFollowUpRepetition: number) {
    // console.log('desired location', {section, page, sectionRepetition, sectionFollowUpRepetition})
    let currentLoc = locToNumber(this.navigator.loc)
    const desiredLoc = locToNumber({section, page, sectionRepetition, sectionFollowUpRepetition})
    // console.log('current location', currentLoc, desiredLoc)
    if (currentLoc < desiredLoc) {
      let c
      for (c = 0; c < 100; c++) {
        currentLoc = locToNumber(this.navigator.loc)
        if (currentLoc >= desiredLoc || !this.currentLocationHasValidResponses() || !this.stepForward(false)) {
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
    if (this.initialLocation && this.navigator.isValidLocation(this.initialLocation)) {
      this.navigator.seekTo(this.initialLocation)
    } else {
      const lastRealAction = this.actions.lastRealAction
      if (lastRealAction) {
        const lastLocation = this.actions.actionToLocation(lastRealAction)
        while (this.currentLocationHasValidResponses() && this.navigator.locationIsAheadOfCurrent(lastLocation) && this.stepForward(false));
        this.stepBackward()
      } else {
        this.navigator.seekTo({section: 0, page: 0, sectionRepetition: 0, sectionFollowUpRepetition: 0})
      }
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
    if (!this._isReplaying) {
      this.emit('atEnd', JSON.parse(JSON.stringify(this.location)))
    }
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
   * @param {string} varName
   * @param {string} sectionFollowUpDatumId
   * @returns {QuestionDatum}
   */
  getSingleDatumByQuestionVarName (varName: string, sectionFollowUpDatumId: string): QuestionDatum {
    let questionId = this.varNameIndex.get(varName)
    if (!questionId) {
      throw Error(`No question matches the var_name, ${varName}. Are you sure you spelled it correctly?`)
    }
    // Find the question which has this specific datu1m id
    let questionData = this.data.getQuestionDataByQuestionId(questionId) || []
    if (sectionFollowUpDatumId) {
      for (let qD of questionData) {
        if (qD.data.findIndex(d => d.id === sectionFollowUpDatumId) > -1) {
          return qD
        }
      }
    } else if (questionData.length === 1) {
      return questionData[0]
    } else {
      throw Error(`No question datum matches the var_name, ${varName}. Does it appear later in the survey?`)
    }
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

}

export let sharedInterviewInstance = null
export function sharedInterview (interview: Interview,
                                 blueprint: Form,
                                 actions?: Action[],
                                 data?: QuestionDatum[],
                                 conditionTags?: ConditionTagInterface,
                                 respondentFills?: RespondentFill[],
                                 baseRespondentConditionTags?: RespondentConditionTag[]) {
  if (!sharedInterviewInstance) {
    sharedInterviewInstance = new InterviewManager(interview, blueprint, actions, data, conditionTags, respondentFills, baseRespondentConditionTags)
  }
  return sharedInterviewInstance
}

export function clearSharedInterview () {
  if (sharedInterviewInstance) {
    sharedInterviewInstance.destroy()
  }
  sharedInterviewInstance = null
}
