import Emitter from '../../../classes/Emitter'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import DatumRecycler from '../services/recyclers/DatumRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import ConditionTagStore from './/ConditionTagStore'
import Datum from '../../../entities/trellis/Datum'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../../entities/trellis/SurveyConditionTag'

export default class DataStore extends Emitter {
  baseRespondentConditionTags: any[] = []
  data: QuestionDatum[] = []
  conditionTags: {
    respondent: RespondentConditionTag[]
    section: SectionConditionTag[]
    survey: SurveyConditionTag[]
  }
  questionDatumIdMap: Map<string, QuestionDatum>
  questionDatumQuestionIdIndex: Map<string, QuestionDatum[]>
  constructor (throttleRate = 10000) {
    super()
    this.reset()
    DatumRecycler.clear()
    QuestionDatumRecycler.clear()
    RespondentConditionTagRecycler.clear()
    SectionConditionTagRecycler.clear()
    FormConditionTagRecycler.clear()
  }

  /**
   * Intitialize the datastore. Emits an initialState event to any subscribers
   */
  initialize () {
    this.emit('initialState', this.data)
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
   * @MOVE_TO_SERVICE_LAYER
   */
  loadData (data) {
    debugger
    // data = JSON.parse(JSON.stringify(data))
    let oData = data
    data = data.map(c => c.copy())
    let datum = []
    let questionDatum = []
    for (let d of data) {
      for (let dat of d.data) {
        datum.push(dat)
      }
      this.add(d, false)
      // d = JSON.parse(JSON.stringify(d))
      d = d.copy()
      d.data = []
      questionDatum.push(d)
    }
    QuestionDatumRecycler.fill(questionDatum)
    DatumRecycler.fill(datum)
  }

  /**
   * Load existing condition tags
   * @param {Object} tags - has respondent, survey and section arrays
   * @MOVE_TO_SERVICE_LAYER
   */
  loadConditionTags (tags: any) {
    if (tags && tags.respondent) {
      this.baseRespondentConditionTags = tags.respondent
    }
    for (let type of ['respondent', 'survey', 'section']) {
      if (this.conditionTags[type] && tags[type]) {
        this.conditionTags[type] = this.conditionTags[type].concat(tags[type])
      }
    }
    this.conditionTags.respondent = this.conditionTags.respondent.map(tag => {
      if (tag.conditionTagId) {
        tag.conditionId = tag.conditionTagId
        delete tag.conditionTagId
      }
      if (tag.conditionTag) {
        ConditionTagStore.add(tag.conditionTag)
        delete tag.conditionTag
      }
      return tag
    })
    RespondentConditionTagRecycler.fill(this.conditionTags.respondent.map(t => new RespondentConditionTag().fromSnakeJSON(t)))
    SectionConditionTagRecycler.fill(this.conditionTags.section.map(t => new SectionConditionTag().fromSnakeJSON(t)))
    FormConditionTagRecycler.fill(this.conditionTags.survey.map(t => new SurveyConditionTag().fromSnakeJSON(t)))
  }

  /**
   * Add a questionDatum to the dataStore
   * @param {QuestionDatum} questionDatum - A single questionDatum
   * @param {Boolean} [shouldPersist = false] - Whether the persist method should be called after adding the data
   */
  add (questionDatum: QuestionDatum, shouldPersist = false) {
    this.data.push(questionDatum)
    this.questionDatumIdMap.set(questionDatum.id, questionDatum)
    let questionIdIndex = this.questionDatumQuestionIdIndex.get(questionDatum.questionId)
    if (!questionIdIndex) {
      questionIdIndex = [questionDatum]
      this.questionDatumQuestionIdIndex.set(questionDatum.questionId, questionIdIndex)
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
   * @param {string} type
   * @param {RespondentConditionTag|SectionConditionTag|SurveyConditionTag} tag
   */
  addTag (type: string, tag:RespondentConditionTag|SectionConditionTag|SurveyConditionTag) {
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
  getSingleQuestionDatumByLocation (questionId: string, sectionRepetition: number, sectionFollowUpDatumId: string, ...args) {
    return this.questionDatumQuestionIdIndex.get(questionId).find(qD =>
      qD.sectionRepetition === sectionRepetition &&
      qD.followUpDatumId === sectionFollowUpDatumId)
  }

  /**
   * Get an array of all existing questionDatum for a question
   * @param {string} questionId
   * @returns {QuestionDatum[] | undefined}
   */
  getQuestionDataByQuestionId (questionId: string) {
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
  _locationMatchesQuestionDatum (questionDatum: QuestionDatum, sectionRepetition: number, sectionFollowUpDatumId: string) {
    return questionDatum.sectionRepetition === sectionRepetition &&
      questionDatum.followUpDatumId === sectionFollowUpDatumId
  }

  /**
   * Get an array of all of the condition tags for this location in the survey
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {Array}
   */
  getAllConditionTagsForLocation (sectionRepetition: number, sectionFollowUpDatumId: string) {
    let tags = this.conditionTags.respondent.concat(<any>this.conditionTags.survey) // Cast to type any so they can be concatenated
    tags = tags.concat(<any>this.conditionTags.section.filter(tag => {
      return tag.repetition === sectionRepetition &&
        tag.followUpDatumId === sectionFollowUpDatumId
    }))
    return tags
  }

  /**
   * Get an array of all the condition tag names for this location in the survey
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {String[}
   */
  getLocationConditionTagNames (sectionRepetition, sectionFollowUpDatumId) {
    return this.getAllConditionTagsForLocation(sectionRepetition, sectionFollowUpDatumId).map(tag => ConditionTagStore.getNameFromId(tag.conditionId))
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
          return qd.sectionRepetition === sectionRepetition && qd.followUpDatumId === sectionFollowUpDatumId
        })
        if (qd) {
          data.push(qd)
        }
      }
    }
    return data
  }

  /**
   * Returns true if the location has a question datum already
   * @param {string} questionId
   * @param {number} sectionRepetition
   * @param {string} sectionFollowUpDatumId
   * @returns {boolean}
   */
  locationHasQuestionDatum (questionId: string, sectionRepetition: number, sectionFollowUpDatumId: string) {
    return this.data.findIndex(qD => {
      return this._locationMatchesQuestionDatum(qD, sectionRepetition, sectionFollowUpDatumId) &&
        qD.questionId === questionId}
    ) !== -1
  }

  /**
   * Get a question datum by id
   * @param id
   * @returns {Object | undefined}
   */
  getQuestionDatumById (id: string) {
    return this.questionDatumIdMap.get(id)
  }

  /**
   * TODO: Copy the datastore into a new version
   */
  copy () {return []}
}

/**
 * Make a deep copy of an object
 * @param json
 * @returns {object|array}
 */
export function copy (json: object) {
  return JSON.parse(JSON.stringify(json))
}
