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
import Question from "../../../entities/trellis/Question";
import QT from '../../../static/question.types'
import PT from '../../../static/parameter.types'
import {locToNumber} from "../services/LocationHelpers";

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
    this.playAllActions()
    this.seekToInitialLocation()
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
    // console.log('next done location', JSON.stringify(this.location))
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
    // console.log('previous done location', JSON.stringify(this.location))
  }

  replayToCurrent (): void {
    this.replayTo(this.location.section, this.location.page, this.location.sectionRepetition, this.location.sectionFollowUpRepetition)
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
        // TODO: Maybe actually validate responses???
        return question.datum.data.length > 0
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
   * Rebuild the state of the survey by zeroing the location and resetting the data before replaying all actions
   */
  playAllActions () {
    // TODO: Verify that location is zeroed correctly
    this._zeroLocation()
    // TODO: Check that state is reset correctly
    this._resetState()
    // TODO: Verify that actions are ordered correctly
    const actionQueue = new ImmutableQueue(this.actions.actions.filter(a => a.actionType !== AT.next && a.actionType !== AT.previous))
    let action = actionQueue.next()
    const nextActionCount = this.actions.actions.reduce((c, a) => a.actionType === AT.next ? c + 1 : c, 0)
    let numPagesReplayed = 0

    while (action) {
      // console.log('action', action)
      // Check if we have a valid question id and skip it the action if we don't
      if (!this.questionIndex.has(action.questionId)) continue

      let actionLocation = locToNumber(this.actions.actionToLocation(action))
      let currentLocation = locToNumber(this.location)
      if (actionLocation === currentLocation) {
        this.performAction(action)
      } else {
        actionLocation = locToNumber(this.actions.actionToLocation(action))
        let currentLocation = locToNumber(this.location)
        let c = 0
        // TODO: Double check for invalid action location???
        while (currentLocation < actionLocation && this.currentLocationHasValidResponses() && c < 100) {
          this.stepForward()
          numPagesReplayed++
          currentLocation = locToNumber(this.location)
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
    this.playAllActions()
    this.seekTo(section, sectionRepetition, sectionFollowUpRepetition, page)
    this._isReplaying = false
  }

  /**
   * Seek through the survey to the last recorded action
   */
  seekToInitialLocation (): void {
    const lastRealAction = this.actions.lastRealAction
    if (lastRealAction) {
      const lastLocation = this.actions.actionToLocation(lastRealAction)
      this.seekTo(lastLocation.section, lastLocation.sectionRepetition, lastLocation.sectionFollowUpRepetition, lastLocation.page)
    } else {
      this.seekTo(0, 0, 0, 0)
    }
  }

  /**
   * Seek to a specific location in the survey
   * @param {number} section
   * @param {number} sectionRepetition
   * @param {number} sectionFollowUpRepetition
   * @param {number} page
   */
  seekTo (section: number, sectionRepetition: number, sectionFollowUpRepetition: number, page: number) {
    let currentLocNumber = locToNumber(this.location)
    let desiredLocNumber = locToNumber({section, sectionRepetition, sectionFollowUpRepetition, page})
    if (desiredLocNumber === currentLocNumber) {
      // Check if we're at a skipped location. Pretty much just for the first location
      let c = 0
      while (this.shouldSkipPage(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page) && !this.navigator.isAtEnd && c < 10) {
        this.stepForward()
        c++
      }
      if (c >= 10) {
        console.log(`We skipped ${c} pages`)
        debugger
      }
    } else if (desiredLocNumber > currentLocNumber) {
      // Iterate forward through optional and readOnly pages until we hit the page we want to reach
      let c = 0
      do {
        this.stepForward()
        currentLocNumber = locToNumber(this.location)
        c++
      } while(desiredLocNumber > currentLocNumber && this.currentLocationHasValidResponses() && c < 100)
      if (c > 10) {
        console.log(`moved forward ${c} steps`)
        debugger
      }
    } else {
      let c = 0
      do {
        this.stepBackward()
        currentLocNumber = locToNumber(this.location)
        c++
      } while (desiredLocNumber < currentLocNumber && this.currentLocationHasValidResponses() && c < 100)
      if (c > 10) {
        console.log(`moved backward ${c} steps`)
        debugger
      }
    }
    // console.log('post seek', JSON.parse(JSON.stringify(this.data.data)))
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
