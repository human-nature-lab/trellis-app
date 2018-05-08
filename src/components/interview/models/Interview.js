import SkipService from '../services/SkipService'
import actionDefinitions from '../services/InterviewActionDefinitions'
import ConditionAssignmentService from '@/services/ConditionAssignmentService'
import ActionStore from '../services/ActionStore'
import Emitter from '@/classes/Emitter'

import InterviewNavigator from '../services/InterviewNavigator'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
export default class Interview extends Emitter {
  constructor (interview, blueprint = null, actions = [], data = []) {
    super()
    this.interview = interview
    this.blueprint = blueprint
    this.data = data
    this.conditionTags = {
      respondent: [],
      survey: [],
      section: []
    }
    this.actions = new ActionStore()
    this.actions.load(actions)
    this.conditionAssigner = new ConditionAssignmentService()
    this.allConditions = new Map()
    this.varNameMap = new Map()
    this.questionMap = new Map()
    this.load(blueprint)
    this.navigator = new InterviewNavigator(this)
  }

  /**
   * This needs to be called before doing anything else
   */
  bootstrap () {
    this._initializeConditionAssignment()
    this.makePageQuestionDatum()
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
    this.data = []
    this.conditionTags = {
      respondent: [],
      survey: [],
      section: []
    }
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
   * All user created actions should go through this method so that the actions are stored
   * @param action
   */
  pushAction (action) {
    // This should insert the action following the order of the question datum
    // if (this.actions.length === 0) {
    this.actions.add(action)
    // } else {
    //   let i
      // TODO: This is a naive search and could be a binary search instead if performance is an issue
      // for (i = 0; i < this.actions.length; i++) {
      //   if (this.actions[i].question_datum_id) {
      //     let questionDatum = this.data.find(qDatum => qDatum.id === this.actions[i].question_datum_id)
      //     if (!questionDatum) {
      //       throw Error(`This question should already have a question datum associated with it. Location: ${JSON.stringify(this.location, null, 2)}`)
      //     }
      //     if (questionDatum.section >= this.location.section) {
      //       if (questionDatum.section_repetition >= this.location.sectionRepetition) {
      //         if (questionDatum.section_follow_up_repetition >= this.location.sectionFollowUpDatumId) {
      //           if (questionDatum.page >= this.location.page) {
      //             if ((new Date()).getTime() >= this.actions[i].created_at) {
      //               break
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      // this.actions.splice(i, 0, action)

    // }
    action.created_at = (new Date()).getTime()
    action.updated_at = (new Date()).getTime()
    this.performAction(action)
  }

  /**
   * This method actually modifies the state based on the action type and payload
   * @param action
   */
  performAction (action) {
    if (actionDefinitions[action.action_type]) {
      console.log(action.action_type)
      let questionDatum = null
      let questionBlueprint = null
      if (action.question_datum_id) {
        questionDatum = this.data.find(q => {
          return q.id === action.question_datum_id
        })
        if (questionDatum) {
          questionBlueprint = this._findQuestionBlueprint(questionDatum.question_id)
        }
      } else if (action.action_type !== 'next' && action.action_type !== 'previous') {
        console.error(action)
        throw new Error('Only next and previous action types are allowed to not be associated with a question datum id')
      }
      actionDefinitions[action.action_type](this, action.payload, questionDatum, questionBlueprint)
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
    this.allConditions.clear()
    this.varNameMap.clear()
    this.questionMap.clear()
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
        for (let skip of page.skips) {
          for (let condition of skip.conditions) {
            this.allConditions.set(condition.id, condition)
          }
        }
        page.questions.sort((questionA, questionB) => {
          return questionA.sort_order - questionB.sort_order
        })
        for (let question of page.questions) {
          this.varNameMap.set(question.var_name, question.id)
          this.questionMap.set(question.id, question)
          question.section = s
          if (question.choices) {
            question.choices.sort((cA, cB) => {
              return cA.sort_order - cB.sort_order
            })
          }
        }
      }
      section.pages = section.question_groups
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
            this.allConditions.set(act.condition.id, act.condition)
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
   * Get a section by index
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
   * @param {Number} datumIndex - The index of the datum that should be removed
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
    let data = []
    for (let i = 0; i < this.data.length; i++) {
      let questionDatum = this.data[i]
      if (this._locationMatchesQuestionDatum(this.location, questionDatum)) {
        data.push(questionDatum)
      }
    }
    return data
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
    this.data.push(questionDatum)
    return questionDatum
  }

  /**
   * Load the survey blueprint and existing data
   * @param blueprint
   */
  load (blueprint) {
    this._loadBlueprint(blueprint)
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
        this.conditionTags.section.push(SectionConditionTagRecycler.getNoKey(this, act))
        break
      case 'form':
        this.conditionTags.survey.push(FormConditionTagRecycler.getNoKey(this, act))
        break
      case 'respondent':
      default:
        this.conditionTags.respondent.push(RespondentConditionTagRecycler.getNoKey(this.interview, act))
    }
  }

  /**
   * Assign the current condition tags
   */
  _evaluateConditionAssignment () {
    // TODO: This should probably be every question in the survey so far
    let questionsWithData = this.getPageQuestions()
    let vars = questionsWithData.reduce((vars, question) => {
      if (!question.datum || !question.datum.data) {
        debugger
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
    console.log('vars', vars)
    for (let question of questionsWithData) {
      for (let act of question.assign_condition_tags) {
        try {
          if (this.conditionAssigner.run(act.id, vars)) {
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
    let tags = []
    this.conditionTags.respondent.forEach(tag => {
      tags.push(tag)
    })
    this.conditionTags.survey.forEach(tag => {
      tags.push(tag)
    })
    this.conditionTags.section.filter(tag => {
      return tag.repetition === this.location.sectionRepetition &&
        tag.follow_up_datum_id === this.location.sectionFollowUpDatumId
    }).forEach(tag => {
      tags.push(tag)
    })
    return tags
  }

  /**
   * Make all non-existant question datum for the current page
   */
  makePageQuestionDatum () {
    let currentPage = this.currentPage()
    for (let questionBlueprint of currentPage.questions) {
      if (this.data.findIndex(qD => this._locationMatchesQuestionDatum(this.location, qD) && qD.question_id === questionBlueprint.id) === -1) {
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
    let data = this.data.find(qDatum => qDatum.id === questionDatumId).data
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
    for (let qDatum of this.data) {
      if (qDatum.question_id === questionId) {
        if (qDatum.section === location.section &&
            qDatum.sectionRepetition === location.sectionRepetition &&
            qDatum.sectionFollowUpDatumId === location.sectionFollowUpDatumId &&
            qDatum.page === location.page) {
          return qDatum
        }
      }
    }
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
    this._evaluateConditionAssignment()
    this.navigator.next()

    this.makePageQuestionDatum()

    // Get assigned condition tags and convert them into a set of condition ids
    let cConditionTags = this._getCurrentConditionTags()
    let conditionTags = new Set(cConditionTags.map(tag => tag.condition_id))
    if (SkipService.shouldSkipPage(this.currentPage().skips, conditionTags)) {
      this._markAsSkipped()
      return this.next()
    }
  }

  previous () {
    // Don't decrement if we're already at the beginning
    if (this.navigator.isAtStart) {
      return this.atBeginning()
    }
    this._evaluateConditionAssignment()
    this.navigator.previous()

    this.makePageQuestionDatum()
    // Get assigned condition tags and convert them into a set of condition ids
    let cConditionTags = this._getCurrentConditionTags()
    let conditionTags = new Set(cConditionTags.map(tag => tag.condition_id))
    if (SkipService.shouldSkipPage(this.currentPage().skips, conditionTags)) {
      this._markAsSkipped()
      return this.previous()
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
  replayTo (section, page, sectionRepetition, sectionFollowUpDatumId) {
    this._isReplaying = true
    this._zeroLocation()
    this._resetState()
    // Iterate through all of the actions that have been recorded in the survey so far
    let actions = this.actions.actions
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i]
      // Don't perform an previous actions or do a next action more than once in a row
      if (action.action_type !== 'previous' && action.action_type !== 'next') {
        this.performAction(action)
      } else if (action.action_type === 'next') {
        this.next()
      }
    }
    // let clock = this._getClockFromLocation({
    //   section: section,
    //   page: page,
    //   sectionRepetition: sectionRepetition,
    //   sectionFollowUpDatumId: sectionFollowUpDatumId
    // })
    // TODO: Is there a better way to achieve this? In theory we could just specify the desired location directly, right?
    // All valid question datum should have been created so we don't really need to use the next or previous buttons. We
    // would have to make sure we aren't visiting an invalid part of the form though. idk...
    // this._setLocationFromClock(clock)
    // this.seekTo(...clock.time)
    // this.navigator.section = section
    this.navigator.setLocation(section, page, sectionRepetition, sectionFollowUpDatumId)
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
    // TODO: Should change to a clock based comparison instead.
    let count = 1
    let DIRS = {FORWARD: 0, BACKWARD: 1}
    // Cast the current location and desired location into a 4 digit number with this structure {section}{sectionRepetition}{sectionFollowUpRepetition}{page}
    let desiredLocNumber = section * 1000000 + sectionRepetition * 10000 + sectionFollowUpRepetition * 100 + page
    let curLocNumber
    let previousDirection
    let currentDirection
    do {
      curLocNumber = this.location.section * 1000000 + this.location.sectionRepetition * 10000 + this.navigator.sectionFollowUpRepetition * 100 + this.location.page
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
    let qDatum = this.data.find(qDatum => {
      return qDatum.question_id === sectionFollowUpQuestionId
    })
    return qDatum
  }

  getSingleDatumByQuestionVarName (varName, followUpDatumId) {
    let questionId = this.varNameMap.get(varName)
    if (!questionId) {
      throw Error(`No question matches the var_name, ${varName}. Are you sure you spelled it correctly?`)
    }
    let question = this.questionMap.get(questionId)
    let section = this._getSection(question.section)
    let qDatum = this.data.find(qDatum => {
      if (section.followUpQuestionId) {
        return qDatum.sectionFollowUpDatumId === followUpDatumId && qDatum.question_id === questionId
      } else {
        return qDatum.question_id === questionId
      }
    })
    if (qDatum) {
      return qDatum
    } else {
      throw Error(`No question datum matches the var_name, ${varName}. Does it appear later in the survey?`)
    }
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
    if (this._getSection(qDatum.section).maxRepetitions || this._getSection(qDatum.section).followUpQuestionId) {
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
  getPageQuestions () {
    let questionDefinitions = this.currentPage().questions
    let questionData = this._getCurrentPageData()
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
