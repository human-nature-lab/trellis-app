import Emitter from '../../../classes/Emitter'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import DatumRecycler from '../services/recyclers/DatumRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import ConditionTagStore from './/ConditionTagStore'

export default class DataStore extends Emitter {
  constructor (throttleRate = 10000) {
    super()
    this.baseRespondentConditionTags = []
    this.reset()
    DatumRecycler.clear()
    QuestionDatumRecycler.clear()
    RespondentConditionTagRecycler.clear()
    SectionConditionTagRecycler.clear()
    FormConditionTagRecycler.clear()
  }

  /**
   * Reset the state of the data and conditionTags
   */
  reset () {
    this.data = []
    this.conditionTags = {
      section: [],
      respondent: this.baseRespondentConditionTags, // Used to prevent removal of existing respondent condition tags
      survey: []
    }
    this.questionDatumIdMap = new Map()
    this.questionDatumQuestionIdIndex = new Map()
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
      d.section_repetition = parseInt(d.section_repetition, 10)
      for (let dat of d.data) {
        datum.push(dat)
      }
      this.add(d, false)
      d = JSON.parse(JSON.stringify(d))
      d.data = []
      questionDatum.push(d)
    }
    QuestionDatumRecycler.fill(questionDatum)
    DatumRecycler.fill(datum)
    this.emit('initialState', this.data)
  }

  /**
   * Load existing condition tags
   * @param {Object} tags - has respondent, survey and section arrays
   */
  loadConditionTags (tags) {
    this.baseRespondentConditionTags = tags.respondent
    for (let type of ['respondent', 'survey', 'section']) {
      if (this.conditionTags[type] && tags[type]) {
        this.conditionTags[type] = this.conditionTags[type].concat(tags[type])
      }
    }
    this.conditionTags.respondent = this.conditionTags.respondent.map(tag => {
      if (tag.condition_tag_id) {
        tag.condition_id = tag.condition_tag_id
        delete tag.condition_tag_id
      }
      if (tag.condition_tag) {
        ConditionTagStore.add(tag.condition_tag)
        delete tag.condition_tag
      }
      return tag
    })
    RespondentConditionTagRecycler.fill(this.conditionTags.respondent)
    SectionConditionTagRecycler.fill(this.conditionTags.section)
    FormConditionTagRecycler.fill(this.conditionTags.survey)
    this.emit('initialState', this.data)
  }

  /**
   * Add a questionDatum to the dataStore
   * @param {Object} questionDatum - A single questionDatum
   * @param {Boolean} [shouldPersist = false] - Whether the persist method should be called after adding the data
   */
  add (questionDatum, shouldPersist = false) {
    this.data.push(questionDatum)
    this.questionDatumIdMap.set(questionDatum.id, questionDatum)
    let questionIdIndex = this.questionDatumQuestionIdIndex.get(questionDatum.question_id)
    if (!questionIdIndex) {
      questionIdIndex = [questionDatum]
      this.questionDatumQuestionIdIndex.set(questionDatum.question_id, questionIdIndex)
    } else {
      questionIdIndex.push(questionDatum)
    }
    this.emit('change', {
      data: this.data,
      conditionTags: this.conditionTags
    })
  }

  /**
   * Add a conditionTag to the dataStore
   * @param type
   * @param tag
   */
  addTag (type, tag) {
    this.conditionTags[type].push(tag)
    this.emit('change', {
      data: this.data,
      conditionTags: this.conditionTags
    })
  }

  /**
   * Get a single questionDatum by its location within the survey
   * @param {String} questionId
   * @param {Number} sectionRepetition
   * @param {String} sectionFollowUpDatumId
   * @returns {Object | undefined}
   */
  getSingleQuestionDatumByLocation (questionId, sectionRepetition, sectionFollowUpDatumId) {
    return this.questionDatumQuestionIdIndex.get(questionId).find(qD =>
      qD.section_repetition === sectionRepetition &&
      qD.follow_up_datum_id === sectionFollowUpDatumId)
  }

  getQuestionDataByQuestionId (questionId) {
    return this.questionDatumQuestionIdIndex.get(questionId)
  }

  /**
   * Comparison function for code reuse
   * @param questionDatum
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {boolean}
   * @private
   */
  _locationMatchesQuestionDatum (questionDatum, sectionRepetition, sectionFollowUpDatumId) {
    return questionDatum.section_repetition === sectionRepetition &&
      questionDatum.follow_up_datum_id === sectionFollowUpDatumId
  }

  /**
   * Get an array of all data for that location
   * @param section
   * @param page
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {Array}
   */
  getAllQuestionDatumByLocation (section, page, sectionRepetition, sectionFollowUpDatumId) {
    let data = []
    for (let qD of this.data) {
      if (qD.section === section && qD.page === page && qD.section_repetition === sectionRepetition && qD.follow_up_datum_id === sectionFollowUpDatumId) {
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
    return tags.map(tag => {
      tag.name = ConditionTagStore.getNameFromId(tag.condition_id)
      return tag
    })
  }

  /**
   * Get all of the data for thse
   * @param {Array} questionIds
   * @param {Number} sectionRepetition
   * @param {String} sectionFollowUpDatumId
   * @returns {Array}
   */
  getQuestionDataByIds (questionIds, sectionRepetition, sectionFollowUpDatumId) {
    let data = []
    for (let id of questionIds) {
      if (this.questionDatumQuestionIdIndex.has(id)) {
        let qd = this.questionDatumQuestionIdIndex.get(id).find(qd => {
          return qd.section_repetition === sectionRepetition && qd.follow_up_datum_id === sectionFollowUpDatumId
        })
        if (qd) {
          data.push(qd)
        }
      }
    }
    return data
  }

  locationHasQuestionDatum (questionId, sectionRepetition, sectionFollowUpDatumId) {
    return this.data.findIndex(qD => this._locationMatchesQuestionDatum(qD, sectionRepetition, sectionFollowUpDatumId) && qD.question_id === questionId) !== -1
  }

  /**
   * Get a question datum by id
   * @param id
   * @returns {Object | undefined}
   */
  getQuestionDatumById (id) {
    return this.questionDatumIdMap.get(id)
  }
}

/**
 * Make a deep copy of an object
 * @param json
 * @returns {object|array}
 */
export function copy (json) {
  return JSON.parse(JSON.stringify(json))
}