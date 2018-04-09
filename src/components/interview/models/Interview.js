import uuidv4 from 'uuid/v4'
import SkipService from '../services/SkipService'
import actionDefinitions from '../services/InterviewActionDefinitions'
import ConditionAssignmentService from '@/services/ConditionAssignmentService'
export default class Interview {
  constructor (interview, blueprint = null, actions = [], data = []) {
    this.interview = interview
    this.blueprint = blueprint
    this.data = data
    this.location = {
      section: 0,
      sectionRepetition: 0,
      sectionFollowUpRepetition: 0,
      page: 0
    }
    this.conditionTags = {
      respondent: [],
      survey: [],
      section: []
    }
    this.actions = actions
    this.conditionAssigner = new ConditionAssignmentService()
    this.allConditions = new Map()
    this.load(blueprint)
  }

  /**
   * All user created actions should go through this method so that the actions are stored
   * @param action
   */
  pushAction (action) {
    this.actions.push(action)
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
    // Sort all levels
    this.blueprint.sections.sort((sectionA, sectionB) => {
      return sectionA.form_sections[0].sort_order - sectionB.form_sections[0].sort_order
    })
    for (let section of this.blueprint.sections) {
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
          if (question.choices) {
            question.choices.sort((cA, cB) => {
              return cA.sort_order - cB.sort_order
            })
          }
        }
      }
      section.pages = section.question_groups
    }
    this._initializeConditionAssignment()
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
   * Return the current section blueprint
   * @returns {Object}
   * @private
   */
  _getCurrentSection () {
    return this.blueprint.sections[this.location.section]
  }

  /**
   * REturn the current page blueprint
   * @returns {Object}
   * @private
   */
  _getCurrentPage () {
    return this._getCurrentSection().pages[this.location.page]
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
      // TODO: take into account survey section and repetition stuff
      if (questionDatum.section === this.location.section && questionDatum.page === this.location.page) {
        data.push(questionDatum)
      }
    }
    return data
  }

  /**
   * Make a single questionDatum from the provided questionBlueprint
   * @param questionBlueprint
   * @returns {{id: *, section_repetition: number, section_follow_up_repetition: number, page: number, section: number, question_id, survey_id: *, created_at: number, updated_at: number, dk_rf: null, dk_rf_val: null, var_name, datum: Array}}
   * @private
   */
  _makeQuestionDatum (questionBlueprint) {
    let questionDatum = {
      id: uuidv4(),
      section_repetition: this.location.sectionRepetition,
      section_follow_up_repetition: this.location.sectionFollowUpRepetition,
      page: this.location.page,
      section: this.location.section,
      question_id: questionBlueprint.id,
      survey_id: this.interview.survey_id,
      created_at: (new Date()).getTime(),
      updated_at: (new Date()).getTime(),
      dk_rf: null,
      dk_rf_val: null,
      var_name: questionBlueprint.var_name,
      datum: []
    }
    questionDatum.data = questionDatum.datum
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
        this.conditionTags.section.push({
          id: uuidv4(),
          survey_id: this.interview.survey_id,
          condition_id: act.condition.id,
          repetition: this.location.sectionRepetition,
          follow_up_question_datum_id: this.location.sectionFollowUpRepetition, // TODO: This is wrong and will need to be changed
          created_at: (new Date()).getTime(),
          updated_at: (new Date()).getTime()
        })
        break
      case 'form':
        this.conditionTags.survey.push({
          id: uuidv4(),
          survey_id: this.interview.survey_id,
          condition_id: act.condition.id,
          created_at: (new Date()).getTime(),
          updated_at: (new Date()).getTime()
        })
        break
      case 'respondent':
      default:
        this.conditionTags.respondent.push({
          id: uuidv4(),
          respondent_id: this.interview.respondent_id,
          condition_id: act.condition.id,
          created_at: (new Date()).getTime(),
          updated_at: (new Date()).getTime()
        })
    }
  }

  /**
   * Assign the current condition tags
   */
  _evaluateConditionAssignment () {
    let questionsWithData = this.getPageQuestions()
    let vars = questionsWithData.reduce((vars, question) => {
      vars[question.var_name] = question.datum.data.map(datum => datum.val)
      return vars
    }, {})
    console.log('vars', vars)
    for (let question of questionsWithData) {
      for (let act of question.assign_condition_tags) {
        if (this.conditionAssigner.run(act.id, vars)) {
          this._assignConditionTag(act)
        }
      }
    }
  }

  /**
   * Get all currently assigned condition tags
   */
  _getCurrentConditionTags () {
    return this.conditionTags.respondent
      .concat(this.conditionTags.survey)
      .concat(this.conditionTags.section.filter(tag => {
        return tag.repetition === this.location.sectionRepetition &&
          tag.follow_up_question_datum_id === this.location.sectionFollowUpRepetition
      }))
  }

  /**
   * Move to the next closest valid page of the survey
   */
  next () {
    this._evaluateConditionAssignment()
    // TODO: handle section follow up and repetitions here
    this.location.page++
    if (this.location.page >= this._getCurrentSection().pages.length) {
      this.location.page = 0
      this.location.section++
    }
    if (this.location.section >= this.blueprint.sections.length) {
      this.location.section--
      this.location.page = this._getCurrentSection().pages.length - 1
      return this.atEnd()
    }
    // Get assigned condition tags and convert them into a set of condition ids
    let conditionTags = this._getCurrentConditionTags().reduce((set, tag) => {
      set.add(tag.condition_id)
    }, new Set())
    if (SkipService.shouldSkipPage(this._getCurrentPage().skips, conditionTags)) {
      this._markAsSkipped()
      this.next()
    }
  }

  /**
   * Move to closest previously valid page of the survey
   */
  previous () {
    this.location.page--
    if (this.location.page < 0) {
      this.location.section--
      if (this.location.section < 0) {
        this.location.section = 0
        this.location.page = 0
        return this.atBeginning()
      }
      this.location.page = this._getCurrentSection().pages.length - 1
    }
    if (SkipService.shouldSkipPage(this._getCurrentPage().skips, new Set())) {
      this._markAsSkipped()
      this.previous()
    }
  }

  /**
   * Mark all current questions as skipped. This is stored as a property on the questionDatum
   * @private
   */
  _markAsSkipped () {
    // TODO: Mark all questions on the current page as skipped
  }

  /**
   * Handle the 'already at the beginning of survey' event
   */
  atBeginning () {
    console.log(`Reached the beginning of the survey`)
  }

  /**
   * Handle 'reached the end of survey' event
   */
  atEnd () {
    console.log(`Reached the end of the survey`)
  }

  /**
   * This method returns the follow up question_datum and data that are associated with the follow up question for that section
   * TODO: Right now this only gets the first question that matches the follow_up_question_id, but it should probably know
   * TODO: if a question is in a repeated section and get the correct question_datum(s) in that case
   * @param sectionId
   * @param sectionRepetitionId
   * @param sectionFollowUpQuestionId
   * @returns {T | undefined}
   * @private
   */
  _getFollowUpQuestionDatum (sectionId, sectionRepetitionId, sectionFollowUpQuestionId) {
    let section = this.blueprint.sections[sectionId]
    let followUpQuestionId = section.form_sections[0].follow_up_question_id
    let followUpDatum = this.data.find(qDatum => qDatum.question_id === followUpQuestionId)
    return followUpDatum ? [followUpDatum] : []
  }

  /**
   * Alias for follow up question datum for the current state of the survey
   * @returns {T}
   */
  getCurrentFollowUpQuestionDatum () {
    return this._getFollowUpQuestionDatum(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpRepetition)
  }

  /**
   * Get an array of the questions for the current page. This function handles merging existing datum with
   * the question blueprint and dereferences everything
   */
  getPageQuestions () {
    let questionDefinitions = this._getCurrentPage().questions
    let questionData = this._getCurrentPageData()
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = JSON.parse(JSON.stringify(question)) // Dereference
      // TODO: this should take into account section repetition and follow ups as well
      let qData = questionData.find(q => q.question_id === question.id)
      if (qData) {
        question.datum = JSON.parse(JSON.stringify(qData))
      } else {
        question.datum = JSON.parse(JSON.stringify(this._makeQuestionDatum(question)))
      }
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
