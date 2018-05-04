import Clock from '@/classes/Clock'
export default class InterviewNavigator {
  constructor (interview) {
    // Section, sectionFollowUpRepetition, sectionRepetition, page
    this.location = {}
    this.clock = new Clock([0, 0, 0, 0], [0, 0, 0, 0])
    this.clock.on('incrementIndex', this._incrementIndex, this)
    this.clock.on('decrementIndex', this._decrementIndex, this)
    this.interview = interview
    this.blueprint = interview.blueprint
    this.updateLocation()
    this.updateMax()
  }
  get section () {
    return this.clock.time[0]
  }
  set section (val) {
    this.clock.time[0] = val
  }
  get sectionRepetition () {
    return this.clock.time[1]
  }
  set sectionRepetition (val) {
    this.clock.time[1] = val
  }
  get page () {
    return this.clock.time[3]
  }
  set page (val) {
    this.clock.time[3] = val
  }
  get sectionFollowUpDatumId () {
    if (this.blueprint.sections[this.section].pages[this.page]) {
      // TODO: Look up the follow up datum id from the clock val
      return null
    } else {
      return null
    }
  }
  set sectionFollowUpDatumId (val) {
    if (this.blueprint.sections[this.section].pages[this.page].followUpQuestionId) {
      // TODO: Look up and set the clock val
    } else {
      this.clock.time[2] = 0
    }
  }
  updateLocation () {
    this.location.section = this.section
    this.location.sectionRepetition = this.sectionRepetition
    this.location.sectionFollowUpDatumId = this.sectionFollowUpDatumId
    this.location.page = this.page
  }
  zero () {
    this.clock.time = [0, 0, 0, 0]
    this.updateMax()
  }

  get isAtEnd () {
    return this.clock.isAtMax
  }

  get isAtStart () {
    return this.clock.isAtMin
  }

  updateMax () {
    let max = this.getMax()
    this.clock.setMaximums(max)
  }

  getMax () {
    let max = []
    max[0] = this.blueprint.sections.length - 1
    max[1] = this.blueprint.sections[this.section].maxRepetitions
    max[2] = 0
    if (this.blueprint.sections[this.section].followUpQuestionId) {
      // TODO: Fill this out. Requires a search and sort at the moment
    }
    max[3] = this.blueprint.sections[this.section].pages.length - 1
    return max
  }
  setLocation (section, page, sectionRepetition, sectionFollowUpDatumId) {
    this.section = section
    this.page = page
    this.sectionRepetition = sectionRepetition
    this.sectionFollowUpDatumId = sectionFollowUpDatumId
    this.updateMax()
    this.updateLocation()
  }

  // In charge of keeping the max values in sync with the state of the form
  _incrementIndex (index) {
    if (index === 0) {
      this.updateMax()
    }
  }

  _decrementIndex (index) {
    if (index === 0) {
      let max = this.getMax()
      this.clock.time[1] = max[1]
      this.clock.time[2] = max[2]
      this.clock.time[3] = max[3]
      this.clock.setMaximums(max)
    }
  }

  /**
   * Move forward a step
   */
  next () {
    this.clock.increment()
    this.updateLocation()
    console.log('loc', JSON.stringify(this.clock.time))
  }

  /**
   * Move back a step
   */
  previous () {
    this.clock.decrement()
    this.updateLocation()
    console.log('loc', JSON.stringify(this.clock.time))
  }
}
