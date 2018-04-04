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
      actionDefinitions[action.action_type](this.data, this.location, action.payload)
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
   * Get all question data for the current page
   * @returns {Array}
   * @private
   */
  _getCurrentPageData () {
    let data = []
    for (let i = 0; i < this.data.length; i++) {
      let questionDatum = this.data[i]
      if (questionDatum.section === this.location.section && questionDatum.page === this.location.page) {
        data.push(questionDatum)
      }
    }
    return data
  }
  _makeDatum (questionBlueprint) {
    this.data.push({
      id: uuidv4(),
      section_repetition: this.location.sectionRepetition,
      question_id: questionBlueprint.id,
      survey_id: this.interview.survey_id,
      created_at: (new Date()).getTime(),
      updated_at: (new Date()).getTime(),
      datum: []
    })
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
      this.end()
    }
    let conditionTags = new Set() // TODO: Actually fill this
    if (SkipService.shouldSkipPage(this._getCurrentPage().skips, conditionTags)) {
      this._markAsSkipped()
      this.next()
    }
  }
  _markAsSkipped () {
    // TODO: Mark all questions on the current page as skipped
  }
  end () {
    console.log(`Reached the ned of the survey`)
  }
  previous () {}
  getPageQuestions () {
    let questionDefinitions = this._getCurrentPage().questions
    let questionData = this._getCurrentPageData()
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = JSON.parse(JSON.stringify(question)) // Dereference
      let qData = questionData.find(q => q.id === question.id)
      if (qData) {
        question.datum = qData
      } else {
        question.datum = this._makeDatum(question.id)
      }
      return question
    })
  }
  copy () {
    return new Interview(JSON.parse(JSON.stringify(this.interview)), JSON.parse(JSON.stringify(this.blueprint)), JSON.parse(JSON.stringify(this.data)))
  }
}
