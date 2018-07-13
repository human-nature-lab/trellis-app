import SkipService from '../services/SkipService'
import actionDefinitions from '../services/InterviewActionDefinitions'
import ConditionAssignmentService from '@/services/ConditionAssignmentService'
import ActionStore from './ActionStore'
import DataStore from './DataStore'
import ConditionTagStore from './ConditionTagStore'
import RespondentFillStore from './RespondentFillStore'
import dataPersistSlave from '../services/DataPersistSlave'
import actionsPersistSlave from '../services/ActionsPersistSlave'
import Emitter from '@/classes/Emitter'

import InterviewNavigator from '../services/InterviewNavigator'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'

export default class Interview extends Emitter {
  constructor (interview, blueprint, actions, data, conditionTags, respondentFills) {
    super()
    this.interview = interview
    this.blueprint = blueprint

    // Indexes and data stores
    this.respondentFills = new RespondentFillStore()
    this.conditionAssigner = new ConditionAssignmentService()
    this.varNameIndex = new Map()
    this.questionIndex = new Map()
    this.questionIdToSectionIndex = new Map()
    this.questionIdToPageIndex = new Map()

    // Initializing all the custom data types
    this._loadBlueprint(blueprint)
    this.data = new DataStore()
    this.actions = new ActionStore(this.blueprint)

    if (data) this.data.loadData(data)
    if (conditionTags) this.data.loadConditionTags(conditionTags)
    if (respondentFills) this.respondentFills.fill(respondentFills)
    if (actions) this.actions.load(actions)

    this.navigator = new InterviewNavigator(this)
    this._initializeConditionAssignment()
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
    this.makePageQuestionDatum()
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
    this.makePageQuestionDatum()
  }

  /**
   * Getter for the current location in the survey
   * @returns {{section: *, sectionRepetition: *, sectionFollowUpDatumId: null, page: *}}
   */
  get location () {
    return this.navigator.location
  }

  /**
   * Play an array of actions
   * @param {Array} actions - The array of actions to play
   */
  playActions (actions) {
    const locationMatches = action => {
      return this.actions.getActionSection(action) === this.location.section &&
        this.actions.getActionPage(action) === this.location.page &&
        action.section_repetition === this.location.sectionRepetition &&
        action.section_follow_up_repetition === this.location.sectionFollowUpDatumRepetition
    }
    for (let action of actions) {
      if (action.action_type !== 'next' && action.action_type !== 'previous') {
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
   * @param {Object} action - The action without location information
   */
  pushAction (action) {
    action.interview_id = this.interview.id
    this.actions.add(action, this.location)
    this.performAction(action, true)
  }

  /**
   * This method actually modifies the state based on the action type and payload
   * @param {Object} action
   * @param {Boolean} [actionWasInitiatedByAHuman = false]
   */
  performAction (action, actionWasInitiatedByAHuman = false) {
    if (actionDefinitions[action.action_type]) {
      let questionDatum = null
      let questionBlueprint = null
      if (action.question_id) {
        let followUpQuestionId = this.questionIdToSectionIndex.get(action.question_id).followUpQuestionId
        let actionFollowUpDatumId = this.navigator.getFollowUpQuestionDatumIdByFollowUpRepetition(followUpQuestionId, action.section_follow_up_repetition)
        questionDatum = this.data.getSingleQuestionDatumByLocation(action.question_id, action.section_repetition, actionFollowUpDatumId)
        questionBlueprint = this._findQuestionBlueprint(action.question_id)
      } else if (action.action_type !== 'next' && action.action_type !== 'previous') {
        console.error(action)
        throw new Error('Only next and previous action types are allowed to not be associated with a question datum id')
      }
      actionDefinitions[action.action_type](this, action.payload, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
    } else {
      console.error('No actionDefinition has been defined for that action yet')
    }
  }

  /**
   * Load and sort the form structure
   * @param {Object} blueprint
   * @private
   */
  _loadBlueprint (blueprint) {
    this.blueprint = Object.assign({}, blueprint)
    ConditionTagStore.clear()
    this.varNameIndex.clear()
    this.questionIndex.clear()
    // Sort all levels
    this.blueprint.sections.sort((sectionA, sectionB) => {
      return sectionA.form_sections[0].sort_order - sectionB.form_sections[0].sort_order
    })

    for (let s = 0; s < this.blueprint.sections.length; s++) {
      let section = this.blueprint.sections[s]
      section.maxRepetitions = section.form_sections[0].max_repetitions
      section.isRepeatable = parseInt(section.form_sections[0].is_repeatable, 10) === 1
      section.followUpQuestionId = section.form_sections[0].follow_up_question_id
      section.question_groups.sort((pageA, pageB) => {
        return pageA.pivot.question_group_order - pageB.pivot.question_group_order
      })
      for (let page of section.question_groups) {
        // for (let skip of page.skips) {
        //   for (let condition of skip.conditions) {
        //     console.log('condition', JSON.stringify(condition, null, 2))
        //     ConditionTagStore.add(condition)
        //   }
        // }
        page.questions.sort((questionA, questionB) => {
          return questionA.sort_order - questionB.sort_order
        })
        for (let question of page.questions) {
          this.varNameIndex.set(question.var_name, question.id)
          this.questionIndex.set(question.id, question)
          question.section = s
          if (question.choices) {
            question.choices.sort((cA, cB) => {
              return cA.pivot.sort_order - cB.pivot.sort_order
            })
          }
          this.questionIdToSectionIndex.set(question.id, section)
          this.questionIdToPageIndex.set(question.id, page)
          this._assignParameters(question)
        }
      }
      section.pages = section.question_groups
    }
  }

  _assignParameters (question) {
    question.parameters = {}
    for (let p of question.question_parameters) {
      switch (p.parameter.name) {
        case 'other':
        case 'other_exclusive':
          for (let choice of question.choices) {
            if (choice.val === p.val) {
              if (!choice.parameters) {
                choice.parameters = {}
              }
              choice.parameters[p.parameter.name] = p.val
            }
          }
          break
        default:
          question.parameters[p.parameter.name] = p.val
      }
    }
  }

  /**
   * Register all condition assignment functions which will be executed when the respondent navigates between pages
   * @private
   */
  _initializeConditionAssignment () {
    this.conditionAssigner.clear()
    this.blueprint.sections.forEach(section => {
      section.question_groups.forEach(page => {
        page.questions.forEach(question => {
          question.assign_condition_tags.forEach(act => {
            ConditionTagStore.add(act.condition)
            this.conditionAssigner.register(act.id, act.logic)
          })
        })
      })
    })
  }

  /**
   * Naive search for a single question id. This could be easily converted to a Map if it's a performance bottleneck
   * @param questionId
   * @private
   */
  _findQuestionBlueprint (questionId) {
    for (let section of this.blueprint.sections) {
      for (let page of section.question_groups) {
        for (let question of page.questions) {
          if (questionId === question.id) {
            return question
          }
        }
      }
    }
  }

  /**
   * Get a section by router
   * @param {Number} index
   * @private
   */
  _getSection (index) {
    return this.blueprint.sections[index]
  }

  /**
   * Return the current section blueprint
   * @returns {Object}
   * @private
   */
  currentSection () {
    return this._getSection(this.location.section)
  }

  /**
   * Return the current page blueprint
   * @returns {Object}
   * @private
   */
  currentPage () {
    return this.currentSection().pages[this.location.page]
  }

  /**
   * Remove a single datum from the supplied question datum
   * @param {Object} questionDatum - The question datum reference to remove the datumm from
   * @param {Number} datumIndex - The router of the datum that should be removed
   */
  deleteSingleQuestionDatumDatum (questionDatum, datumIndex) {
    questionDatum.data.splice(datumIndex, 1)
  }

  /**
   * Remove the data associated with this questionDatum.
   * @param questionDatum
   */
  deleteAllQuestionDatumData (questionDatum) {
    let qDatum = this.data.find(qDatum => qDatum.id === questionDatum.id)
    if (qDatum) {
      qDatum.data = []
    }
  }

  /**
   * Get all question data for the current page
   * @returns {Array}
   * @private
   */
  _getCurrentPageData () {
    return this.data.get(this.location.section, this.location.page, this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
  }

  /**
   * Question data is valid for this location
   * @param location
   * @param questionDatum
   * @returns {boolean}
   * @private
   */
  _locationMatchesQuestionDatum (location, questionDatum) {
    return questionDatum.section === this.location.section &&
    questionDatum.page === this.location.page &&
    questionDatum.section_repetition === this.location.sectionRepetition &&
    questionDatum.follow_up_datum_id === this.location.sectionFollowUpDatumId
  }

  /**
   * Make a single questionDatum from the provided questionBlueprint
   * @param questionBlueprint
   * @returns {{id: *, section_repetition: number, section_follow_up_repetition: number, page: number, section: number, question_id, survey_id: *, created_at: number, updated_at: number, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   * @private
   */
  _makeQuestionDatum (questionBlueprint) {
    let questionDatum = QuestionDatumRecycler.getNoKey(this, questionBlueprint) // OPTIMIZATION: This could be optimized by using 'get' instead of getNoKey
    this.data.add(questionDatum)
    return questionDatum
  }

  /**
   * Assign the specified condition tag
   * @param assign_condition_tag
   * @private
   */
  _assignConditionTag (act) {
    // TODO: We could check for existing condition tags before creating it again, but this will
    // be taken care of by the resetting of the form and replaying existing conditions for pages
    // that are being modified as opposed to being created for the first time
    switch (act.scope) {
      case 'section':
        this.data.addTag('section', SectionConditionTagRecycler.getNoKey(this, act))
        break
      case 'form':
        this.data.addTag('survey', FormConditionTagRecycler.getNoKey(this, act))
        break
      case 'respondent':
      default:
        this.data.addTag('respondent', RespondentConditionTagRecycler.getNoKey(this.interview, act))
    }
  }

  /**
   * Assign the current condition tags
   */
  _evaluateConditionAssignment () {
    // TODO: This should probably be every question in the survey so far
    let questionsWithData = this.getPageQuestions(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)
    let vars = questionsWithData.reduce((vars, question) => {
      if (!question.datum || !question.datum.data) {
        throw Error('question datum and data should already exist!')
      }
      switch (question.question_type.name) {
        case 'multiple_select':
        case 'relationship':
        case 'geo':
        case 'photo':
          vars[question.var_name] = question.datum.data.map(datum => datum.val)
          break
        default:
          vars[question.var_name] = question.datum.data.length ? question.datum.data[0].val : undefined
      }
      return vars
    }, {})
    console.log('condition assignment vars', vars)
    for (let question of questionsWithData) {
      for (let act of question.assign_condition_tags) {
        try {
          if (this.conditionAssigner.run(act.id, vars)) {
            console.log('assigning', act)
            this._assignConditionTag(act)
          }
        } catch (err) {
          console.error('Unable to assign condition tag correctly')
          throw err
        }
      }
    }
  }

  /**
   * Get all currently assigned condition tags
   */
  _getCurrentConditionTags () {
    return this.data.getLocationConditionTagNames(this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
  }

  /**
   * Make all non-existant question datum for the current page
   */
  makePageQuestionDatum () {
    let currentPage = this.currentPage()
    for (let questionBlueprint of currentPage.questions) {
      if (!this.data.locationHasQuestionDatum(questionBlueprint.id, this.location.sectionRepetition, this.location.sectionFollowUpDatumId)) {
        this._makeQuestionDatum(questionBlueprint)
      }
    }
  }

  /**
   * Get the data for a particular question datum in order
   * @param questionDatumId
   * @param useRandom
   * @private
   */
  _getQuestionDatumDataInOrder (questionDatumId, useRandom = false) {
    let data = this.data.getQuestionDatumById(questionDatumId).data
    if (useRandom) {
      data.sort(function (a, b) {
        return a.random_val - b.random_val
      })
    } else {
      data.sort(function (a, b) {
        return a.sort_val - b.sort_val
      })
    }
    return data
  }

  /**
   * Get the corresponding questionDatum for this place in the survey
   */
  _getQuestionDatumByLocation (location, questionId) {
    return this.data.getSingleQuestionDatumByLocation(questionId, location.section, location.page, location.sectionRepetition, location.sectionFollowUpDatumId)
  }

  /**
   * Called when the leaving any page. Includes skipped pages
   * @private
   */
  _onPageExit () {
    this._evaluateConditionAssignment()
  }

  /**
   * Called when entering any page. Includes skipped pages
   * @private
   */
  _onPageEnter () {
    // let actions = this.actions.getLocationActions(this.location)
    this.makePageQuestionDatum()
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
    this._onPageExit()
    this.navigator.next()
    this._onPageEnter()

    // Skip any question that's in a follow up section with no data to follow up on
    if (this.currentSection().followUpQuestionId && this.navigator.clock.clockMax[2] < 0) {
      console.log('skipping question in empty follow up section', JSON.stringify(this.location))
      return this.next()
    }

    // Get assigned condition tags and convert them into a set of condition ids
    let conditionTagNames = new Set(this._getCurrentConditionTags())
    console.log('next location:', JSON.stringify(this.location), 'conditionTags:', JSON.stringify(Array.from(conditionTagNames)))
    if (SkipService.shouldSkipPage(this.currentPage().skips, conditionTagNames)) {
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
    this._onPageExit()
    this.navigator.previous()
    this._onPageEnter()

    // Skip any question that's in a follow up section with no data to follow up on
    if (this.currentSection().followUpQuestionId && this.navigator.clock.clockMax[2] < 0) {
      console.log('skipping question in empty follow up section', JSON.stringify(this.location))
      return this.previous()
    }

    // Get assigned condition tags and convert them into a set of condition ids
    let conditionTagNames = new Set(this._getCurrentConditionTags())
    console.log('previous location:', JSON.stringify(this.location), 'conditionTags:', JSON.stringify(Array.from(conditionTagNames)))
    if (SkipService.shouldSkipPage(this.currentPage().skips, conditionTagNames)) {
      console.log('skipping location', JSON.stringify(this.location))
      this._markAsSkipped()
      return this.previous()
    }
    console.log('previous done location', JSON.stringify(this.location))
  }

  replayToCurrent () {
    this.replayTo(this.location.section, this.location.page, this.location.sectionRepetition, this.location.sectionFollowUpDatumRepetition)
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
  replayTo (section, page, sectionRepetition, sectionFollowUpRepetition) {
    this._isReplaying = true
    this._zeroLocation()
    this._resetState()
    this.playActions(this.actions.actions)

    this.seekTo(section, page, sectionRepetition, sectionFollowUpRepetition)
    this._isReplaying = false
  }

  /**
   * Seek to a specific location in the survey
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   */
  seekTo (section, sectionRepetition, sectionFollowUpRepetition, page) {
    let count = 1
    let DIRS = {FORWARD: 0, BACKWARD: 1}
    // Cast the current location and desired location into a 4 digit number with this structure {section}{sectionRepetition}{sectionFollowUpRepetition}{page}
    let desiredLocNumber = section * 1000000 + sectionRepetition * 10000 + sectionFollowUpRepetition * 100 + page
    let curLocNumber
    let previousDirection
    let currentDirection
    do {
      curLocNumber = this.location.section * 1000000 + this.location.sectionRepetition * 10000 + this.location.sectionFollowUpDatumRepetition * 100 + this.location.page
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
      this._onPageExit()
      this.emit('atEnd', JSON.parse(JSON.stringify(this.location)))
    }
    console.log(`Reached the end of the survey`)
  }

  /**
   * Get the questionDatum corresponding with this follow up section
   * @param sectionFollowUpQuestionId
   * @returns {T}
   */
  getFollowUpQuestionDatum (sectionFollowUpQuestionId) {
    let qDatum = this.data.getQuestionDataByQuestionId(sectionFollowUpQuestionId)
    if (qDatum && qDatum.length > 1) {
      throw Error('We need to handle follow up questions. Too many question datum for this followUpQuestionId')
    }
    return qDatum ? qDatum[0] : null
  }

  /**
   * Returns the value for a respondent fill with the specified varName
   * @param {String} varName
   * @returns {String|null}
   */
  getRespondentFillByVarName (varName) {
    return this.respondentFills.get(varName)
  }

  /**
   * Get a question datum by the question var name. There should only be one per question per repetition
   * @param {String} varName
   * @param {Number} sectionFollowUpRepetition
   * @returns {Object}
   */
  getSingleDatumByQuestionVarName (varName, sectionFollowUpRepetition) {
    let questionId = this.varNameIndex.get(varName)
    if (!questionId) {
      throw Error(`No question matches the var_name, ${varName}. Are you sure you spelled it correctly?`)
    }
    console.log('Getting question by varname', varName, sectionFollowUpRepetition)
    let questionDatum = this.data.getQuestionDataByQuestionId(questionId) || []
    for (let qD of questionDatum) {
      if (qD.data.findIndex(d => d.event_order === sectionFollowUpRepetition) > -1) {
        return qD
      }
    }
    throw Error(`No question datum matches the var_name, ${varName}. Does it appear later in the survey?`)
  }

  /**
   * This method returns the follow up question_datum and data that are associated with the follow up question for that section
   * TODO: Right now this only gets the first question that matches the follow_up_question_id, but it should probably know
   * TODO: if a question is in a repeated section and get the correct question_datum(s) in that case
   * @param {String} sectionFollowUpQuestionId
   * @param {Number} currentRepetition - Will be used for handling follow up questions from repeated sections
   * @param {Number} currentFollowUpSection - Will be used for handling follow up questions from follow up sections
   * @returns {T | undefined}
   * @private
   */
  getFollowUpQuestionDatumData (sectionFollowUpQuestionId, currentRepetition = 0, currentFollowUpSection = 0) {
    let qDatum = this.getFollowUpQuestionDatum(sectionFollowUpQuestionId)
    // TODO: This should change if we're using randomization for follow up sections
    if (!qDatum || !qDatum.data) return []

    // Guard against repeated sections for now
    if (this.questionIdToSectionIndex.get(sectionFollowUpQuestionId).maxRepetitions || this.questionIdToSectionIndex.get(sectionFollowUpQuestionId).followUpQuestionId) {
      throw Error(`Can't handle follow up questions from repeated sections currently`)
    }
    qDatum.data.sort(function (a, b) {
      return a.sort_val - b.sort_val
    })
    return qDatum.data
  }

  /**
   * Alias for follow up question datum for the current state of the survey
   * @returns {T}
   */
  getCurrentFollowUpQuestionDatum () {
    return this.getFollowUpQuestionDatumData(this.location.sectionFollowUpDatumId)
  }

  /**
   * Get an array of the questions for the current page. This function handles merging existing datum with
   * the question blueprint and dereferences everything
   */
  getPageQuestions (section, sectionRepetition, sectionFollowUpDatumId, page) {
    let questionDefinitions = this.currentPage().questions
    let questionData = this.data.getQuestionDataByIds(questionDefinitions.map(q => q.id), sectionRepetition, sectionFollowUpDatumId)
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = JSON.parse(JSON.stringify(question)) // Dereference
      // TODO: this should take into account section repetition and follow ups as well
      let qData = questionData.find(q => q.question_id === question.id)
      question.datum = qData ? JSON.parse(JSON.stringify(qData)) : {}
      return question
    })
  }

  /**
   * Make a copy of the current interview
   * @returns {Interview}
   */
  copy () {
    return new Interview(JSON.parse(JSON.stringify(this.interview)), JSON.parse(JSON.stringify(this.blueprint)), JSON.parse(JSON.stringify(this.data)))
  }
}

let sharedInterviewInstance = null
export function sharedInterview (...args) {
  if (!sharedInterviewInstance) {
    sharedInterviewInstance = new Interview(...args)
  }
  return sharedInterviewInstance
}

export function clearSharedInterview () {
  if (sharedInterviewInstance) {
    sharedInterviewInstance.destroy()
  }
  sharedInterviewInstance = null
}
