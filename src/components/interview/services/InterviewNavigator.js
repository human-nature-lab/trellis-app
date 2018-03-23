import dataStore from './InterviewDataStore'
class InterviewNavigator {
  constructor () {
    // Structure holds the form data that define how the survey is traversed. This includes sections, pages and questions
    // with repeated sections/pages and skip conditions included
    this.structure = {}
    this.dataStore = dataStore
    this.state = {
      section: 0,             // index of the current section
      sectionRepetition: 0,   // number of completed sectionRepetitions
      page: 0                 // index of the current page
    }
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
   * Check if a condition tag is present in the current context
   * @param conditionId
   * @returns {Boolean} - True if the condition tag is present
   * @private
   */
  hasConditionTag (conditionId) {
    return this.dataStore.hasConditionTag(conditionId, this.state.section)
  }

  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param skipCondition
   * @param conditions
   * @returns {boolean}
   * @private
   */
  _shouldSkipPage (skipConditions) {
    let shouldSkip = false

    for (let skipCondition of skipConditions) {
      // Cast condition booleans as boolean
      for (let boolKey of ['show_hide', 'any_all']) {
        if (skipCondition[boolKey] === '0' || skipCondition[boolKey] === 0) {
          skipCondition[boolKey] = false
        } else if (skipCondition[boolKey] === '1' || skipCondition[boolKey] === 1) {
          skipCondition[boolKey] = true
        }
      }
      if (skipCondition.show_hide) {
        if (skipCondition.any_all) {
          // Show if any are true
          shouldSkip = true
          for (let condition of skipCondition.conditions) {
            if (this.hasConditionTag(condition.id)) {
              shouldSkip = false
              break
            }
          }
        } else {
          // Show if all are true
          shouldSkip = false
          for (let condition of skipCondition.conditions) {
            if (!this.hasConditionTag(condition.id)) {
              shouldSkip = true
              break
            }
          }
        }
      } else {
        if (skipCondition.any_all) {
          // Hide if any are true
          shouldSkip = false
          for (let condition of skipCondition.conditions) {
            if (this.hasConditionTag(condition.id)) {
              shouldSkip = true
              break
            }
          }
        } else {
          // Hide if all are true
          shouldSkip = true
          for (let condition of skipCondition.conditions) {
            if (!this.hasConditionTag(condition.id)) {
              shouldSkip = false
              break
            }
          }
        }
      }
    }
    return shouldSkip
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
      return this.next()
    }
    console.log(this.state)
  }

  /**
   * Get all of the questions for the current page. TODO: This should probably be moved to another service.
   * @returns {computed.questions|Array}
   */
  getCurrentQuestionBlueprints () {
    this.questions = this.structure.sections ? this.structure.sections[this.state.section].question_groups[this.state.page].questions : []
    return this.questions
  }

  /**
   * Move to the previous part of the survey if it exists
   */
  previous () {
    console.log('previous')
    let section = this.structure.sections[this.state.section]
    this.state.page --
    if (this.state.page < 0) {
      this.state.page = section.question_groups.length - 1
      this.state.sectionRepetition --
    }
    if (this.state.sectionRepetition < 0) {
      this.state.sectionRepetition = 0
      this.state.section --
    }
    if (this.state.section < 0) {
      this.state.page = 0
      this.state.sectionRepetition = 0
      this.state.section = 0
      console.log("We've reached the beginning of the survey")
    } else if (this._shouldSkipPage(section.question_groups[this.state.page].skips)) {
      this.previous()
    }
  }

  /**
   * End the survey and interview
   */
  end () {
    console.log('Survey ended')
  }
}

export default new InterviewNavigator()
