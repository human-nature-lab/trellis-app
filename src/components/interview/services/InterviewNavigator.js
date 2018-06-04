import Emitter from '../../../classes/Emitter'
export default class InterviewNavigator extends Emitter {
  constructor (interview) {
    super()
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
    let max = this.getMax(this.page, this.section, this.sectionRepetition, this.sectionFollowUpDatumRepetition)
    this.setMax(max)
  }
  setMax (max) {
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
    let max = this.getCurrentMax()
    return this.section === max[0] && this.sectionRepetition === max[1] && this.sectionFollowUpDatumRepetition === max[2] && this.page === max[3]
  }

  get isAtStart () {
    return this.section === 0 && this.sectionRepetition === 0 && this.sectionFollowUpDatumRepetition === 0 && this.page === 0
  }
  getCurrentMax () {
    return this.getMax(this.page, this.section, this.sectionRepetition, this.sectionFollowUpDatumRepetition)
  }
  getMax (page, section, sectionRepetition, sectionFollowUpDatumRepetition) {
    let max = []
    max[0] = this.blueprint.sections.length - 1
    max[1] = this.blueprint.sections[section].maxRepetitions
    max[2] = 0
    let followUpQuestionId = this.blueprint.sections[section].followUpQuestionId
    if (followUpQuestionId) {
      // TODO: Handle follow up questions from repeatedSections and follow up sections
      let data = this.interview.getFollowUpQuestionDatumData(followUpQuestionId)
      max[2] = data.length - 1
    }
    max[3] = this.blueprint.sections[section].pages.length - 1
    return max
  }

  setLocation (section, page, sectionRepetition, sectionFollowUpDatumId) {
    this.section = section
    this.page = page
    this.sectionRepetition = sectionRepetition
    this.sectionFollowUpDatumId = sectionFollowUpDatumId
    this.updateLocation()
  }

  isValidLocation (max, page, section, sectionRepetition, sectionFollowUpDatumRepetition) {
    return page <= max.page &&
      section <= max.section &&
      sectionRepetition <= max.sectionRepetition &&
      sectionFollowUpDatumRepetition <= max.sectionFollowUpDatumRepetition
  }

  getNext (page, section, sectionRepetition, sectionFollowUpDatumRepetition) {
    let m = this.getMax(page, section, sectionRepetition, sectionFollowUpDatumRepetition)
    let max = {
      section: m[0],
      sectionRepetition: m[1],
      sectionFollowUpDatumRepetition: m[2],
      page: m[3]
    }
    console.log('next', page, sectionRepetition, sectionFollowUpDatumRepetition, section)
    page++
    if (page > max.page) {
      page = 0
      sectionRepetition++
    }
    if (sectionRepetition > max.sectionRepetition) {
      sectionRepetition = 0
      sectionFollowUpDatumRepetition++
    }
    if (sectionFollowUpDatumRepetition > max.sectionFollowUpDatumRepetition) {
      sectionFollowUpDatumRepetition = 0
      section++
      m = this.getMax(page, section, sectionRepetition, sectionFollowUpDatumRepetition)
      max = {
        section: m[0],
        sectionRepetition: m[1],
        sectionFollowUpDatumRepetition: m[2],
        page: m[3]
      }
      if (section > max.section) {
        throw Error('Reached the end of the survey')
      }
      // Handle follow up sections
      if (max.sectionFollowUpDatumRepetition < 0) {
        section++
        if (section > max.section) {
          throw Error('Reached the end of the survey')
        }
      }
    }
    return {page, section, sectionRepetition, sectionFollowUpDatumRepetition}
  }

  getPrevious (page, section, sectionRepetition, sectionFollowUpDatumRepetition) {
    let m = this.getMax(page, section, sectionRepetition, sectionFollowUpDatumRepetition)
    let max = {
      section: m[0],
      sectionRepetition: m[1],
      sectionFollowUpDatumRepetition: m[2],
      page: m[3]
    }
    page--
    if (page < 0) {
      page = max.page
      sectionRepetition--
    }
    if (sectionRepetition < 0) {
      sectionRepetition = max.sectionRepetition
      sectionFollowUpDatumRepetition--
    }
    if (sectionFollowUpDatumRepetition < 0) {
      sectionFollowUpDatumRepetition = max.sectionFollowUpDatumRepetition
      section--
      m = this.getMax(page, section, sectionRepetition, sectionFollowUpDatumRepetition)
      max = {
        section: m[0],
        sectionRepetition: m[1],
        sectionFollowUpDatumRepetition: m[2],
        page: m[3]
      }
      sectionRepetition = max.sectionRepetition
      sectionFollowUpDatumRepetition = max.sectionFollowUpDatumRepetition
      page = max.page
    }
    console.log('previous', page, sectionRepetition, sectionFollowUpDatumRepetition, section)
    if (section < 0) {
      section = 0
      page = 0
      sectionRepetition = 0
      sectionFollowUpDatumRepetition = 0
      throw Error('Reached beginning of survey')
    }
    return {page, section, sectionRepetition, sectionFollowUpDatumRepetition}
  }

  /**
   * Move forward a step
   */
  next () {
    try {
      let next = this.getNext(this.page, this.section, this.sectionRepetition, this.sectionFollowUpDatumRepetition)
      this.page = next.page
      this.section = next.section
      this.sectionRepetition = next.sectionRepetition
      this.sectionFollowUpDatumRepetition = next.sectionFollowUpDatumRepetition
    } catch (err) {
      console.log(err)
      this.emit('end')
    }
    this.updateLocation()
  }

  /**
   * Move back a step
   */
  previous () {
    try {
      let prev = this.getPrevious(this.page, this.section, this.sectionRepetition, this.sectionFollowUpDatumRepetition)
      this.page = prev.page
      this.section = prev.section
      this.sectionRepetition = prev.sectionRepetition
      this.sectionFollowUpDatumRepetition = prev.sectionFollowUpDatumRepetition
    } catch (err) {
      console.log(err)
      this.emit('beginning')
    }
    this.updateLocation()
  }
}
