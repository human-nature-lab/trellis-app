import InterviewData from '../services/interview-data/InterviewDataService'
import _ from 'lodash'
import DiffService from '../services/DiffService'

import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import DatumRecycler from '../services/recyclers/DatumRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'

export default class DataStore {
  constructor (throttleRate = 10000) {
    this.reset()
    this._lastPersistedState = {
      data: [],
      conditionTags: {
        section: [],
        respondent: [],
        survey: []
      }
    }
    this._interval = setInterval(this.persistIfChanges.bind(this), throttleRate / 2)
    this.persist = _.debounce(this.save.bind(this), throttleRate, {
      leading: false,
      maxWait: throttleRate
    })
  }

  persistIfChanges () {
    let diff = getDiff({
      data: this.data,
      conditionTags: this.conditionTags
    }, this._lastPersistedState)
    if (hasDataChanges(diff.data) || hasConditionChanges(diff.conditionTags)) {
      this.persist()
    }
  }

  /**
   * Reset the state of the data and conditionTags
   */
  reset () {
    this.data = []
    this.conditionTags = {
      section: [],
      respondent: [],
      survey: []
    }
    this.questionDatumIdMap = new Map()
    this.questionDatumQuestionIdMap = new Map()
  }

  /**
   * Add an array of questionDatum to the dataStore without sending any updates
   * @param data
   */
  loadData (data) {
    data = JSON.parse(JSON.stringify(data))
    let datum = []
    let questionDatum = []
    for (let d of data) {
      d.section = parseInt(d.section, 10)
      d.page = parseInt(d.page, 10)
      d.section_repetition = parseInt(d.section_repetition, 10)
      for (let dat of d.data) {
        datum.push(dat)
      }
      this.add(d, false)
      d = JSON.parse(JSON.stringify(d))
      d.data = []
      questionDatum.push(d)
    }
    this._lastPersistedState.data = _.cloneDeep(this.data)
    QuestionDatumRecycler.fill(questionDatum)
    DatumRecycler.fill(datum)
  }

  /**
   * Load existing condition tags
   * @param {Object} tags - has respondent, survey and section arrays
   */
  loadConditionTags (tags) {
    for (let type of ['respondent', 'survey', 'section']) {
      if (this.conditionTags[type] && tags[type]) {
        this.conditionTags[type] = this.conditionTags.concat(tags[type])
      }
    }
    this._lastPersistedState.conditionTags = _.cloneDeep(this.conditionTags)
    RespondentConditionTagRecycler.fill(this.conditionTags.respondent)
    SectionConditionTagRecycler.fill(this.conditionTags.section)
    FormConditionTagRecycler.fill(this.conditionTags.survey)
  }

  /**
   * Add a questionDatum to the dataStore
   * @param {Object} questionDatum - A single questionDatum
   * @param {Boolean} [shouldPersist = false] - Whether the persist method should be called after adding the data
   */
  add (questionDatum, shouldPersist = false) {
    this.data.push(questionDatum)
    this.questionDatumIdMap.set(questionDatum.id, questionDatum)
    let questionIdIndex = this.questionDatumQuestionIdMap.get(questionDatum.question_id)
    if (!questionIdIndex) {
      questionIdIndex = [questionDatum]
      this.questionDatumQuestionIdMap.set(questionDatum.question_id, questionIdIndex)
    } else {
      questionIdIndex.push(questionDatum)
    }
    this.hasAddedData = true
    if (shouldPersist) {
      this.persist()
    }
  }

  /**
   * Add a conditionTag to the dataStore
   * @param type
   * @param tag
   */
  addTag (type, tag) {
    this.conditionTags[type].push(tag)
    this.hasAddedData = true
    this.persist()
  }

  /**
   * Get a single questionDatum by its location within the survey
   * @param questionId
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {Object | undefined}
   */
  getSingleQuestionDatumByLocation (questionId, section, page, sectionRepetition, sectionFollowUpRepetition) {
    return this.data.find(qD => qD.question_id === questionId && this._locationMatchesQuestionDatum(qD, section, page, sectionRepetition, sectionFollowUpRepetition))
  }

  getQuestionDataByQuestionId (questionId) {
    return this.questionDatumQuestionIdMap.get(questionId)
  }

  /**
   * Comparison function for code reuse
   * @param questionDatum
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {boolean}
   * @private
   */
  _locationMatchesQuestionDatum (questionDatum, section, page, sectionRepetition, sectionFollowUpRepetition) {
    return questionDatum.section === section &&
      questionDatum.page === page &&
      questionDatum.section_repetition === sectionRepetition &&
      questionDatum.section_follow_up_repetition === sectionFollowUpRepetition
  }

  /**
   * Get an array of all data for that location
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpRepetition
   * @returns {Array}
   */
  getAllQuestionDatumByLocation (section, page, sectionRepetition, sectionFollowUpRepetition) {
    let data = []
    for (let qD of this.data) {
      if (this._locationMatchesQuestionDatum(qD, section, page, sectionRepetition, sectionFollowUpRepetition)) {
        data.push(qD)
      }
    }
    return data
  }

  /**
   * Get an array of all of the condition tags for this location in the survey
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {Array}
   */
  getAllConditionTagsForLocation (sectionRepetition, sectionFollowUpDatumId) {
    let tags = []
    this.conditionTags.respondent.forEach(tag => {
      tags.push(tag)
    })
    this.conditionTags.survey.forEach(tag => {
      tags.push(tag)
    })
    this.conditionTags.section.filter(tag => {
      return tag.repetition === sectionRepetition &&
        tag.follow_up_datum_id === sectionFollowUpDatumId
    }).forEach(tag => {
      tags.push(tag)
    })
    return tags
  }

  locationHasQuestionDatum (questionId, section, page, sectionRepetition, sectionFollowUpDatumRepetition) {
    return this.data.findIndex(qD => this._locationMatchesQuestionDatum(qD, section, page, sectionRepetition, sectionFollowUpDatumRepetition) && qD.question_id === questionId) !== -1
  }

  /**
   * Get a question datum by id
   * @param id
   * @returns {Object | undefined}
   */
  getQuestionDatumById (id) {
    return this.questionDatumIdMap.get(id)
  }

  /**
   * Actually store the new data on disk
   */
  save () {
    if (this._existingRequest) {
      console.log('data saving request is in progress')
      return
    }
    this.hasAddedData = false
    this._existingRequestState = _.cloneDeep({
      data: this.data,
      conditionTags: this.conditionTags
    })
    let diff = getDiff(this._existingRequestState, this._lastPersistedState)
    console.log('saving data', JSON.stringify(this._existingRequestState, null, 2))
    this._existingRequest = InterviewData.sendDiff(diff).then(body => {
      this._existingRequest = null
      this._lastPersistedState = this._existingRequestState
      // Make another throttled request if new data has been stored since the last save
      if (this.hasAddedData) {
        this.persist()
      }
    }).catch(() => {
      this._existingRequest = null
    })
  }
}

export function getDiff (newState, prevState) {
  return {
    data: DiffService.dataDiff(newState.data, prevState.data),
    conditionTags: DiffService.conditionTagsDiff(newState.conditionTags, prevState.conditionTags)
  }
}

/**
 * Check if the data diff has any data
 * @param diff - Result of [DiffService#dataDiff]{@link DiffService#dataDiff}
 * @returns {boolean}
 */
export function hasDataChanges (diff) {
  return diff.questionDatum.added.length > 0 ||
    diff.questionDatum.modified.length > 0 ||
    diff.questionDatum.removed.length > 0 ||
    diff.datum.added.length > 0 ||
    diff.datum.removed.length > 0 ||
    diff.datum.modified.length > 0
}

/**
 * Check if the condition diff has any data
 * @param diff - Result of [DiffService#conditionTagsDiff]{@link DiffService#conditionTagsDiff}
 * @returns {boolean}
 */
export function hasConditionChanges (diff) {
  return diff.section.added.length > 0 || diff.section.removed.length > 0 ||
    diff.respondent.added.length > 0 || diff.respondent.removed.length > 0 ||
    diff.survey.added.length > 0 || diff.survey.removed.length > 0
}

/**
 * Make a deep copy of an object
 * @param json
 * @returns {object|array}
 */
export function copy (json) {
  return JSON.parse(JSON.stringify(json))
}
