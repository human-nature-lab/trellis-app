import Section from './Section'
import Question from './Question'
/**
 * A Survey is a data structure that mimicks the structure of the form including repeated sections and pages. A survey
 * is only able to modify the state of the current page move backwards and forwards between pages. The main purpose of
 * this data structure is to capture the repeated nature of a survey.
 */
export default class Survey {
  constructor (blueprint) {
    this.id = blueprint ? blueprint.id : null
    this.blueprint = {
      sections: []
    }
    this.sections = []
    this.location = {
      section: 0,
      sectionRepetition: 0,
      page: 0,
      pageRepetition: 0
    }
    if (blueprint) this.loadBlueprint(blueprint)
  }

  /**
   * Take a JSON type object and convert it into JavaScript objects
   * @param {object} structure - Structure of a form
   */
  loadBlueprint (blueprint) {
    this.id = blueprint.id
    for (let section of blueprint.sections) {
      let sectionBlueprint = {
        id: section.id,
        order: section.form_sections[0].sort_order,
        isRepeatable: section.form_sections[0].is_repeatable,
        maxRepetitions: section.form_sections[0].max_repetitions,
        followUpQuestionId: section.form_sections[0].follow_up_question_id,
        pages: []
      }
      for (let page of section.question_groups) {
        let pageBlueprint = {
          questions: page.questions,
          id: page.id,
          skips: page.skips,
          order: page.pivot.question_group_order,
          followUpQuestionId: null, // TODO: Make pages repeatable
          isRepeatable: false,      // TODO: Make pages repeatable
          maxRepititions: 1         // TODO: Make pages repeatable
        }
        sectionBlueprint.pages.push(pageBlueprint)
      }
      this.blueprint.sections.push(sectionBlueprint)
    }
    this._addSection()
  }

  /**
   * Add a single instance of a section to the current section repetitions
   * @private
   */
  _addSection (section) {
    const sectionBlueprint = this.blueprint.sections[this.location.section]
    if (!this.sections[this.location.section]) {
      this.sections.push({
        sectionId: sectionBlueprint.id,
        repetitions: []
      })
    }
    const repetitionDatum = {
      id: this.sections[this.location.section].repetitions.length
    }
    let pageBlueprint = sectionBlueprint.pages[0]
    let sectionD = new Section({
      sectionId: this.blueprint.sections[this.location.section].id,
      repetitionDatum: repetitionDatum,
      pages: []
    })
    this.sections[this.location.section].repetitions.push(sectionD)
    this._addPage(sectionD, pageBlueprint)
  }

  /**
   * Add a single page
   * @param sectionRepetition
   * @param pageBlueprint
   * @private
   */
  _addPage (sectionRepetition, pageBlueprint) {
    let repeatedQuestion = pageBlueprint.follow_up_id || null
    sectionRepetition.pages.push({
      sectionId: sectionRepetition,
      sectionRepetition: sectionRepetition,
      repeatedQuestion: repeatedQuestion,
      repetitions: [{
        repetitionDatum: {
          id: 0
        },
        questions: pageBlueprint.questions.map(q => {
          return new Question(q)
        })
      }]
    })
  }

  _addPageRepetition (section) {}

  /**
   * Get an array of question models for the current page
   */
  getCurrentQuestions () {
    return this.sections[this.location.section]
      .repetitions[this.location.sectionRepetition]
      .pages[this.location.page]
      .repetitions[this.location.pageRepetition].questions
  }

  /**
   * Get the question object by id
   * @param id
   */
  getQuestion (id) {
    return this.getCurrentQuestions().find(q => q.id === id)
  }

  /**
   * Returns the current page
   * @returns {{repetitionDatum, questions}|*}
   */
  getCurrentPage () {
    return this.sections[this.location.section].repetitions[this.location.sectionRepetition].pages[this.location.page].repetitions[this.location.pageRepetition]
  }

  /**
   * Returns the current page blueprint
   */
  getCurrentPageBlueprint () {
    return this.blueprint.sections[this.location.section].pages[this.location.page]
  }

  /**
   * Returns the current section
   */
  getCurrentSection () {
    return this.sections[this.location.section].repetitions[this.location.sectionRepetition]
  }

  /**
   * Returns the current section blueprint
   */
  getCurrentSectionBlueprint () {
    return this.blueprint.sections[this.location.section].pages[this.location.page]
  }

  /**
   * Handle the end of the survey
   */
  end () {
    console.log(`You've reached the end of the survey`)
  }

  /**
   * Move to the next visible page of the survey incrementing repeated sections
   */
  next () {
    console.log('next')
    this.location.pageRepetition ++
    let pageBlueprint = this.getCurrentPageBlueprint()
    // TODO: Handle follow up questions with repeated pages (question_groups)
    if (!pageBlueprint.isRepeatable || this.location.pageRepetition >= pageBlueprint.maxRepititions) {
      this.location.pageRepetition = 0
      this.location.page ++
    }
    if (this.location.page >= this.getCurrentSection().pages.length) {
      this.location.page = 0
      this.location.sectionRepetition ++
    }
    let sectionBlueprint = this.getCurrentSectionBlueprint()
    if (!sectionBlueprint.isRepeatable || !sectionBlueprint.followUpQuestionId) {
      this.location.sectionRepetition = 0
      this.location.section ++
    }
    if (this.location.section >= this.sections.length) {
      this.end()
    }
  }

  /**
   * Move to the previously visible page of the survey
   */
  previous () {
    console.log('previous')
  }
}
