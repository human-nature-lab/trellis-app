export default class InterviewNavigator {
  constructor (interview) {
    // Section, sectionFollowUpRepetition, sectionRepetition, page
    this.loc = [0, 0, 0, 0]
    this.max = [0, 0, 0, 0]
    this.interview = interview
    this.blueprint = interview.blueprint
    this.updateMax()
  }
  zero () {
    this.loc = [0, 0, 0, 0]
  }
  get section () {
    return this.loc[0]
  }
  set section (val) {
    this.loc[0] = val
  }
  get sectionFollowUpRepetition () {
    return this.loc[1]
  }
  set sectionFollowUpRepetition (val) {
    this.loc[1] = val
  }
  get sectionRepetition () {
    return this.loc[2]
  }
  set sectionRepetition (val) {
    this.loc[2] = val
  }
  get page () {
    return this.loc[3]
  }
  set page (val) {
    this.loc[3] = val
  }

  get isAtEnd () {
    return false
  }

  get isAtStart () {
    return false
  }

  updateMax () {
    this.max[0] = this.blueprint.sections.length - 1
    this.max[1] = this.blueprint.sections[this.section].maxRepetitions
    this.max[2] = 0
    if (this.blueprint.sections[this.section].followUpQuestionId) {
      // TODO: Fill this out
    }
    this.max[3] = this.blueprint.sections[this.section].pages.length - 1
  }

  getLocation () {
    return {
      section: this.section,
      sectionRepetition: this.sectionRepetition,
      page: this.page,
      sectionFollowUpDatumId: null
    }
  }

  // In charge of keeping the max values in sync with the state of the form
  _incrementedIndex (index) {
    if (index === 0) {
      this.updateMax()
      // this.loc[1] = 0
      // this.loc[2] = 0
      // this.loc[3] = 0
    }
  }

  _decrementedIndex (index) {
    if (index === 0) {
      this.updateMax()
      // this.loc[1] = this.max[1]
      // this.loc[2] = this.max[2]
      // this.loc[3] = this.max[3]
    }
  }

  /**
   * Move forward a step
   */
  next () {
    // if (this.isAtEnd) return
    // Invalidate cache
    this._isAtStart = null
    this._isAtEnd = null
    let done
    let index = this.loc.length - 1
    do {
      done = true
      this.loc[index]++
      if (this.loc[index] > this.max[index]) {
        this.loc[index] = 0
        index--
        done = false
      }
      this._incrementedIndex(index)
      // We are already at the max state so we need to exit without exceeding the max state
      if (index < 0) {
        done = true
      }
    } while (!done)
  }

  /**
   * Move back a step
   */
  previous () {
    // if (this.isAtStart) return
    // Invalidate cache
    this._isAtEnd = null
    this._isAtStart = null
    let done
    let index = this.loc.length - 1
    do {
      done = true
      this.loc[index]--
      if (this.loc[index] < 0) {
        this.loc[index] = this.max[index]
        index--
        done = false
      }
      this._decrementedIndex(index)
      // We are at the minimum state so we need to exit without passing it
      if (index >= this.loc.length) {
        done = true
      }
    } while (!done)
  }
}
