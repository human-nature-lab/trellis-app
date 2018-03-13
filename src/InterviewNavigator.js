class InterviewNavigator {
  constructor () {
    // Structure holds the form data that define how the survey is traversed. This includes sections, pages and questions
    // with repeated sections/pages and skip conditions included
    this.structure = {}

    // Assigned conditions can be assigned to the respondent, form or section
    this.respondentConditions = {}
    this.formConditions = {}
    this.sectionConditions = {}

    this.rosterData = {}
    this.state = {
      section: 0,             // index of the current section
      sectionRepetition: 0,   // number of completed sectionRepetitions
      page: 0                 // index of the current page
    }
    this.questions = []
  }

  /**
   * Make a copy of the passed in structure. This can be a 'bare bones' version of the form
   * @param structure
   */
  loadStructure (structure) {
    this.structure = Object.assign({}, structure)
    // Sort all levels
    this.structure.sections.sort((sectionA, sectionB) => {
      return sectionA.form_sections[0].sort_order > sectionB.form_sections[0].sort_order
    })
    this.structure.sections.forEach(section => {
      section.question_groups.sort((pageA, pageB) => {
        return pageA.pivot.question_group_order > pageB.pivot.question_group_order
      })
      section.question_groups.forEach(page => {
        page.questions.sort((questionA, questionB) => {
          return questionA.sort_order > questionB.sort_order
        })
      })
    })
  }

  /**
   * Load a bunch of conditions together
   * @param conditions
   */
  loadConditions (conditions) {
    // Conditions can be assigned to the respondent, form and/or section and they are all passed into the skip evaluations
    this.assignedConditions = Object.assign({}, conditions)
  }

  /**
   * Assign a single condition for this respondent
   * @param condition
   */
  assignRespondentCondition (condition) {
    this.respondentConditions[condition.id] = condition
    return this
  }

  /**
   * Assign a form condition
   * @param condition
   */
  assignFormCondition (condition) {
    this.formConditions[condition.id] = condition
    return this
  }

  /**
   * Assign a section condition
   * @param conditions
   */
  assignSectionConditions (condition, repetition) {
    if (!repetition) {
      repetition = this.state.sectionRepetition
    }
    if (!this.sectionConditions[this.state.section]) {
      this.sectionConditions[this.state.section] = []
    }
    if (!this.sectionConditions[this.state.section][repetition]) {
      this.sectionConditions[this.state.section][repetition] = {}
    }
    this.sectionConditions[this.state.section][repetition] = condition
    return this
  }

  /**
   * Check if the supplied skipConditions and conditions return a 'skip' value. AKA should a question_group be skipped.
   * @param skipCondition
   * @param conditions
   * @returns {boolean}
   * @private
   */
  _shouldSkipPage (skipConditions, sectionRepetition) {

    let shouldSkip = false;
    for (let skipCondition of skipConditions) {
      if (skipCondition.show_hide){
        if (skipCondition.any_all) {
          // Show if any are true
        } else {
          // Show if all are true
        }
      } else {
        if (skipCondition.any_all) {
          // Hide if any are true
        } else {
          // Show if all are true
        }
      }
    }
  }

  /**
   * Move to the next part of the survey if it exists. This works by just incrementing the page and section until it finds
   * a page that shouldn't be skipped or the form ends.
   */
  next () {
    // Increment the page first
    this.state.page ++
    if (this.state.page >= this.structure.sections[this.state.section].question_groups.length) {
      // Current page is outside the section so we increment sectionRepetition and then check if it is invalid
      this.state.sectionRepetition ++
      this.state.page = 0
      let section = this.structure.sections[this.state.section]
      let formSection = section.form_sections[0]
      let isRepeatable = parseInt(formSection.is_repeatable, 10)
      let isFollowUp = formSection.follow_up_question_id !== null
      let numFollowUpQuestions = 0 // TODO: modify this so that it is the correct number of responses to that question
      // Conditions to move to the next section for:
      //  - section is not repeatable or a follow question.
      //  - section is repeatable and has exceeded the max number of repetitions.
      //  - TODO: section is a follow up question and has exceeded number responses in referenced question.
      if (!(isRepeatable || isFollowUp) || (isRepeatable && this.state.sectionRepetition >= formSection.max_repetitions) || (isFollowUp && this.state.sectionRepetition >= numFollowUpQuestions)) {
        this.state.section ++
        this.state.sectionRepetition = 0
      }
    }
    // The form has ended
    if (this.state.section >= this.structure.sections.length) {
      this.end()
    }
    // Check skip conditions and keep moving forward if the section is skipped
    if (this._shouldSkipPage(this.structure.sections[this.state.section].question_groups[this.state.page].skips, this.assignedConditions)) {
      this.next()
    }
  }

  /**
   * Get all of the questions for the current page. TODO: This should probably be moved to another service.
   * @returns {computed.questions|Array}
   */
  getCurrentPageQuestions () {
    this.questions = this.structure.sections ? this.structure.sections[this.state.section].question_groups[this.state.page].questions : []
    return this.questions
  }

  /**
   * Move to the previous part of the survey if it exists
   */
  previous () {
    console.log('previous')
  }

  /**
   * End the survey and interview
   */
  end () {
    console.log('Survey ended')
  }
}

export default new InterviewNavigator()
