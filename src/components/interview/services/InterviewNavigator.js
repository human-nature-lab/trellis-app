export default class InterviewNavigator {
  constructor (interview) {
    // Section, sectionFollowUpRepetition, sectionRepetition, page
    this.location = {}
    this._location = {
      section: 0,
      sectionRepetition: 0,
      sectionFollowUpDatumId: null,
      sectionFollowUpRepetition: 0,
      page: 0
    }
    this.max = {}
    this.interview = interview
    this.blueprint = interview.blueprint
    this.updateLocation()
    this.updateMax()
  }
  get section () {
    return this._location.section
  }
  set section (val) {
    this._location.section = val
  }
  get sectionRepetition () {
    return this._location.sectionRepetition
  }
  set sectionRepetition (val) {
    this._location.sectionRepetition = val
  }
  get page () {
    return this._location.page
  }
  set page (val) {
    this._location.page = val
  }
  get sectionFollowUpDatumId () {
    if (!this._location.sectionFollowUpDatumId) {
      let followUpQuestionId = this.blueprint.sections[this.section].followUpQuestionId
      if (followUpQuestionId) {
        // TODO: Handle follow up questions from repeatedSections and follow up sections
        let data = this.interview.getFollowUpQuestionDatumData(followUpQuestionId)
        if (data && data.length) {
          let datum = data.find(d => d.event_order === this.sectionFollowUpDatumRepetition)
          if (!datum) {
            throw Error('No datum present with that event order')
          }
          this._location.sectionFollowUpDatumId = datum.id
        }
      }
    }
    return this._location.sectionFollowUpDatumId
  }
  set sectionFollowUpDatumId (newId) {
    this._location.sectionFollowUpDatumId = null
    let followUpQuestionId = this.blueprint.sections[this.section].followUpQuestionId
    if (newId && followUpQuestionId) {
      // TODO: Handle follow up questions from repeatedSections and follow up sections
      let data = this.interview.getFollowUpQuestionDatumData(followUpQuestionId)
      if (data && data.length) {
        let index = data.find(datum => datum.id === newId)
        this._location.sectionFollowUpDatumId = newId
        this._location.sectionFollowUpRepetition = index
      }
    }
  }
  get sectionFollowUpDatumRepetition () {
    return this._location.sectionFollowUpRepetition
  }
  set sectionFollowUpDatumRepetition (val) {
    this._location.sectionFollowUpRepetition = val
    this._location.sectionFollowUpDatumId = null
  }
  updateMax () {
    let max = this.getMax()
    this.max.section = max[0]
    this.max.sectionRepetition = max[1]
    this.max.sectionFollowUpDatumRepetition = max[2]
    this.max.page = max[3]
  }
  setToMax () {
    this.sectionRepetition = this.max.sectionRepetition
    this.sectionFollowUpDatumRepetition = this.max.sectionFollowUpDatumRepetition
    this.page = this.max.page
  }
  updateLocation () {
    this.location.section = this.section
    this.location.sectionRepetition = this.sectionRepetition
    this.location.sectionFollowUpDatumId = this.sectionFollowUpDatumId
    this.location.sectionFollowUpDatumRepetition = this.sectionFollowUpDatumRepetition
    this.location.page = this.page
  }
  zero () {
    this.section = 0
    this.page = 0
    this.sectionRepetition = 0
    this.sectionFollowUpDatumRepetition = 0
  }

  get isAtEnd () {
    let max = this.getMax()
    return this.section === max[0] && this.sectionRepetition === max[1] && this.sectionFollowUpDatumRepetition === max[2] && this.page === max[3]
  }

  get isAtStart () {
    return this.section === 0 && this.sectionRepetition === 0 && this.sectionFollowUpDatumRepetition === 0 && this.page === 0
  }

  getMax () {
    let max = []
    max[0] = this.blueprint.sections.length - 1
    max[1] = this.blueprint.sections[this.section].maxRepetitions
    max[2] = 0
    let followUpQuestionId = this.blueprint.sections[this.section].followUpQuestionId
    if (followUpQuestionId) {
      // TODO: Handle follow up questions from repeatedSections and follow up sections
      let data = this.interview.getFollowUpQuestionDatumData(followUpQuestionId)
      max[2] = data.length - 1
    }
    max[3] = this.blueprint.sections[this.section].pages.length - 1
    return max
  }

  setLocation (section, page, sectionRepetition, sectionFollowUpDatumId) {
    this.section = section
    this.page = page
    this.sectionRepetition = sectionRepetition
    this.sectionFollowUpDatumId = sectionFollowUpDatumId
    this.updateLocation()
  }

  /**
   * Move forward a step
   */
  next () {
    this.page++
    if (this.page > this.max.page) {
      this.page = 0
      this.sectionRepetition++
    }
    if (this.sectionRepetition > this.max.sectionRepetition) {
      this.sectionRepetition = 0
      this.sectionFollowUpDatumRepetition++
    }
    if (this.sectionFollowUpDatumRepetition > this.max.sectionFollowUpDatumRepetition) {
      this.sectionFollowUpDatumRepetition = 0
      this.section++
      this.updateMax()
    }
    if (this.section > this.max.section) {
      this.section = this.max.section
      this.setToMax()
    }
    this.updateLocation()
  }

  /**
   * Move back a step
   */
  previous () {
    this.page--
    if (this.page < 0) {
      this.page = this.max.page
      this.sectionRepetition--
    }
    if (this.sectionRepetition < 0) {
      this.sectionRepetition = this.max.sectionRepetition
      this.sectionFollowUpDatumRepetition--
    }
    if (this.sectionFollowUpDatumRepetition < 0) {
      this.sectionFollowUpDatumRepetition = this.max.sectionFollowUpDatumRepetition
      this.section--
      this.updateMax()
      this.setToMax()
    }
    if (this.section < 0) {
      this.section = 0
      this.zero()
    }
    this.updateLocation()
  }
}
