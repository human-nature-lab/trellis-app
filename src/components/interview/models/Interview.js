import uuidv4 from 'uuid/v4'
import SkipService from '../services/SkipService'
import actionDefinitions from '../services/InterviewActionDefinitions'
export default class Interview {
  constructor (interview, blueprint = null, actions = [], data = []) {
    this.interview = interview
    this.blueprint = {}
    this.data = []
    this.location = {
      section: 0,
      sectionRepetition: 0,
      sectionFollowUpRepetition: 0,
      page: 0
    }
    this.actions = actions
    this.load(blueprint, data)
  }

  /**
   * All user created actions should go through this method so that the actions are stored
   * @param action
   */
  pushAction (action) {
    this.actions.push(action)
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
      let questionData = null
      if (action.question_datum_id) {
        questionDatum = this.data.find(q => {
          return q.id === action.question_datum_id
        })
        questionData = questionDatum.data
      }
      actionDefinitions[action.action_type](this, action.payload, questionDatum, questionData)
    } else {
      console.error('No actionDefinition has been defined for that action yet')
    }
  }

  /**
   * Load the form structure
   * @param {Object} blueprint
   * @private
   */
  _loadBlueprint (blueprint) {
    this.blueprint = Object.assign({}, blueprint)
    // Sort all levels
    this.blueprint.sections.sort((sectionA, sectionB) => {
      return sectionA.form_sections[0].sort_order > sectionB.form_sections[0].sort_order
    })
    this.blueprint.sections.forEach(section => {
      section.question_groups.sort((pageA, pageB) => {
        return pageA.pivot.question_group_order > pageB.pivot.question_group_order
      })
      section.question_groups.forEach(page => {
        page.questions.sort((questionA, questionB) => {
          return questionA.sort_order > questionB.sort_order
        })
      })
      section.pages = section.question_groups
    })
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
   * Load the data into this service
   * @param data
   * @private
   */
  _loadData (data) {
    this.data = data
  }

  /**
   * Remove the data associated with this questionDatum.
   * @param questionDatum
   */
  deleteQuestionDatumData (questionDatum) {
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
  _makeQuestionDatum (questionBlueprint) {
    let questionDatum = {
      id: uuidv4(),
      section_repetition: this.location.sectionRepetition,
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
  load (blueprint, data) {
    this._loadBlueprint(blueprint)
    this._loadData(data)
  }
  next () {
    // TODO: handle section follow up and repetitions here
    this.location.page++
    if (this.location.page >= this._getCurrentSection().pages.length) {
      this.location.page = 0
      this.location.section++
    }
    if (this.location.section >= this.blueprint.sections.length) {
      this.location.section--
      return this.atEnd()
    }
    let conditionTags = new Set() // TODO: Actually fill this
    if (SkipService.shouldSkipPage(this._getCurrentPage().skips, conditionTags)) {
      this._markAsSkipped()
      this.next()
    }
  }
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

  _markAsSkipped () {
    // TODO: Mark all questions on the current page as skipped
  }
  atBeginning () {
    console.log(`Reached the beginning of the survey`)
  }
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
  getCurrentFollowUpQuestionDatum () {
    return this._getFollowUpQuestionDatum(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpRepetition)
  }
  getPageQuestions () {
    let questionDefinitions = this._getCurrentPage().questions
    let questionData = this._getCurrentPageData()
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = JSON.parse(JSON.stringify(question)) // Dereference
      // TODO: this should take into account section repetition and follow ups as well
      let qData = questionData.find(q => q.question_id === question.id)
      if (qData) {
        question.datum = qData
      } else {
        question.datum = this._makeQuestionDatum(question)
      }
      return question
    })
  }
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
