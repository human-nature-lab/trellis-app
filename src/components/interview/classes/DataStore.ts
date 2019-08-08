import Emitter from '../../../classes/Emitter'
import Question from '../../../entities/trellis/Question'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import DatumRecycler from '../services/recyclers/DatumRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import cts, { ConditionTagStore } from './ConditionTagStore'
import Datum from '../../../entities/trellis/Datum'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../../entities/trellis/SurveyConditionTag'
import InterviewDataInterface, {
  ConditionTagInterface,
  ConditionTagScope
} from '../../../services/interview/InterviewDataInterface'
import ConditionTag from '../../../entities/trellis/ConditionTag'
import Action from '../../../entities/trellis/Action'
import cloneDeep from 'lodash/cloneDeep'
import InterviewService from '../../../services/interview/InterviewService'
import { Mutex, MutexInterface } from 'async-mutex'

export interface FindFunction<T> {
  (o: T, i?: number, a?: T[]): boolean
}

export interface FilterFunction<T> {
  (o: T, i?: number, a?: T[]): boolean
}

const conditionTagScopes = [ConditionTagScope.RESPONDENT, ConditionTagScope.SURVEY, ConditionTagScope.SECTION]

export default class DataStore extends Emitter {
  private baseRespondentConditionTags: any[] = []
  public data: QuestionDatum[] = []
  public conditionTags: ConditionTagInterface = {
    [ConditionTagScope.RESPONDENT]: [],
    [ConditionTagScope.SECTION]: [],
    [ConditionTagScope.SURVEY]: []
  }
  private datumIdMap: Map<string, Datum> = new Map()
  private questionDatumIdMap: Map<string, QuestionDatum> = new Map()
  private questionDatumQuestionIdIndex: Map<string, QuestionDatum[]> = new Map()
  private actionIdMap: Map<string, Datum> = new Map()
  private followUpDatumIdMap: Map<string, Datum> = new Map()
  private conditionTagStore: ConditionTagStore = cts
  private previousState!: InterviewDataInterface
  private mutex = new Mutex()
  private releaseMutex!: MutexInterface.Releaser

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
    this.previousState = this.getState()
    this.emit('initialState', this.data)
  }

  /**
   * Persist any changes to the data here
   */
  public async save (interviewId: string) {
    console.log('waiting to acquire data mutex')
    this.releaseMutex = await this.mutex.acquire()
    console.log('acquired data mutex')
    try {
      const newState = this.getState()
      await InterviewService.saveDiff(interviewId, newState, this.previousState)
      this.previousState = newState
    } finally {
      console.log('releasing data mutex')
      this.releaseMutex()
    }
  }

  /**
   * Get state
   */
  private getState (): InterviewDataInterface {
    return cloneDeep({
      data: this.data,
      conditionTags: this.conditionTags
    })
  }

  /**
   * Reset the state of the data and conditionTags
   */
  reset () {
    // Clear all arrays without dereferencing
    this.data.splice(0, this.data.length)
    this.conditionTags.section.splice(0, this.conditionTags.section.length)
    this.conditionTags.respondent.splice(0, this.conditionTags.respondent.length, ...this.baseRespondentConditionTags)
    this.conditionTags.survey.splice(0, this.conditionTags.survey.length)
    this.questionDatumIdMap.clear()
    this.questionDatumQuestionIdIndex.clear()
    this.datumIdMap.clear()
    this.actionIdMap.clear()
    this.followUpDatumIdMap.clear()
    this.emitChange()
  }

  /**
   * Add an array of questionDatum to the dataStore without sending any updates
   * @param data
   * @MOVE_TO_SERVICE_LAYER
   */
  loadData (data: QuestionDatum[]) {
    data = data.map(c => c.copy())
    let datum = []
    let questionDatum = []
    for (let d of data) {
      for (let dat of d.data) {
        this.datumIdMap.set(dat.id, dat)
        datum.push(dat)
      }
      this.add(d)
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
   * @param {RespondentConditionTag[]} baseRespondentConditionTags - respondent condition tags that were not assigned by this form and should not be removed
   * @MOVE_TO_SERVICE_LAYER
   */
  loadConditionTags (tags: any, baseRespondentConditionTags?: RespondentConditionTag[]) {
    if (baseRespondentConditionTags) {
      this.baseRespondentConditionTags = baseRespondentConditionTags
    } else if (tags && tags.respondent) {
      this.baseRespondentConditionTags = tags.respondent
    }
    for (let type of conditionTagScopes) {
      if (this.conditionTags[type] && tags[type]) {
        for (let tag of tags[type]) {
          this.addTag(type, tag)
        }
      }
    }
    RespondentConditionTagRecycler.fill(this.conditionTags.respondent)
    SectionConditionTagRecycler.fill(this.conditionTags.section)
    FormConditionTagRecycler.fill(this.conditionTags.survey)
  }

  /**
   * Add a questionDatum to the dataStore
   * @param {QuestionDatum} questionDatum - A single questionDatum
   * @param {Boolean} [shouldPersist = false] - Whether the persist method should be called after adding the data
   */
  add (questionDatum: QuestionDatum) {
    this.data.push(questionDatum)
    this.questionDatumIdMap.set(questionDatum.id, questionDatum)
    let questionIdIndex = this.questionDatumQuestionIdIndex.get(questionDatum.questionId)
    if (!questionIdIndex) {
      questionIdIndex = [questionDatum]
      this.questionDatumQuestionIdIndex.set(questionDatum.questionId, questionIdIndex)
    } else {
      questionIdIndex.push(questionDatum)
    }
    this.emitChange()
  }

  getDatumById (datumId: string): Datum|null {
    for (let j = 0; j < this.data.length; j++) {
      for (let i = 0; i < this.data[j].data.length; i++) {
        if (this.data[j].data[i].id === datumId) {
          return this.data[j].data[i]
        }
      }
    }
  }

  /**
   * Returns the action_id associated with a questionDatumId in a follow up section.
   * @param {string} questionDatumId
   * @returns {string}
   */
  public getFollowUpActionId (questionId: string, sectionFollowUpDatumId: string, sectionRepetition: number): string {
    const questionData: QuestionDatum[] = this.questionDatumQuestionIdIndex.get(questionId)
    let questionDatum = questionData.find(qd => qd.followUpDatumId === sectionFollowUpDatumId &&
      qd.sectionRepetition === sectionRepetition)
    if (!questionDatum) throw Error('Question datum id must be valid')
    const datum = this.datumIdMap.get(questionDatum.followUpDatumId)
    if (!datum) throw Error('Follow up datum id must be valid')
    return datum.actionId
  }

  public emitChange () {
    this.emit('change', {
      data: this.data,
      conditionTags: this.conditionTags
    })
  }

  /**
   * An accessor function to add a datum to a questionDatum. This will notify any subscribers of the change.
   * @param {QuestionDatum} questionDatum
   * @param {QuestionDatum} qd
   * @param {Action} action
   * @returns {Datum}
   */
  public addDatum (questionDatum: QuestionDatum, qd: QuestionDatum, action: Action): Datum {
    // console.log('adding datum', arguments)
    const datum = DatumRecycler.getNoKey(qd, action)
    datum.randomSortOrder = action.randomSortOrder
    this.datumIdMap.set(datum.id, datum)
    this.actionIdMap.set(datum.actionId, datum)
    datum.sortOrder = questionDatum.data.length
    questionDatum.data.push(datum)
    this.emitChange()
    return datum
  }

  /**
   * TODO: Do this and then use this anywhere we're removing datum from questionDatum
   * An accessor function to remove datum from a questionDatum. This will notify any subscribers of the change.
   * @param {QuestionDatum} questionDatum
   * @param {Function} findFunc
   * @returns {boolean}
   */
  public removeDatum (questionDatum: QuestionDatum, findFunc: FindFunction<Datum>): boolean {
    let removedData = false
    const datumIndex = questionDatum.data.findIndex(findFunc)
    if (datumIndex > -1) {
      questionDatum.data.splice(datumIndex, 1)
      removedData = true
    }
    // Update the sort order for remaining datum
    for (let i = datumIndex; i < questionDatum.data.length; i++) {
      questionDatum.data[i].sortOrder = i;
    }
    this.emitChange()
    return removedData
  }

  /**
   * Filter out any datum on this supplied question datum. This filter happens in reverse order.
   * @param {QuestionDatum} questionDatum
   * @param {FilterFunction<Datum>} filterFunc
   * @returns {boolean} - returns true if any data were removed
   */
  public filterDatum (questionDatum: QuestionDatum, filterFunc: FilterFunction<Datum>): boolean {
    let removedData = false
    let i = questionDatum.data.length
    while (i--) {
      if (filterFunc(questionDatum.data[i], i, questionDatum.data)) {
        questionDatum.data.splice(i, 1)
        removedData = true
      }
    }
    return removedData
  }

  /**
   * Remove all datum for the supplied QuestionDatum
   * @param {QuestionDatum} questionDatum
   * @returns {boolean}
   */
  public removeAllDatum (questionDatum: QuestionDatum): boolean {
    const dataWasRemoved = questionDatum.data.length > 0
    questionDatum.data.splice(0)
    this.emitChange()
    return dataWasRemoved
  }

  /**
   * Add a conditionTag to the dataStore
   * @param {string} type
   * @param {RespondentConditionTag | SectionConditionTag | SurveyConditionTag} tag
   * @param {ConditionTag} conditionTag
   */
  addTag (type: ConditionTagScope, tag: RespondentConditionTag | SectionConditionTag | SurveyConditionTag, conditionTag?: ConditionTag): void {
    // @ts-ignore
    this.conditionTags[type].push(tag)
    if (tag.conditionTag) {
      this.conditionTagStore.add(tag.conditionTag)
    }
    if (conditionTag) {
      this.conditionTagStore.add(conditionTag)
    }
    this.emitChange()
  }

  /**
   * Get a single questionDatum by its location within the survey
   * @param {string} questionId
   * @param {number} sectionRepetition
   * @param {string} sectionFollowUpDatumId
   * @param args
   * @returns {QuestionDatum | null}
   */
  getSingleQuestionDatumByLocation (questionId: string, sectionRepetition: number, sectionFollowUpDatumId: string, ...args): QuestionDatum|undefined {
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
  private _locationMatchesQuestionDatum (questionDatum: QuestionDatum, sectionRepetition: number, sectionFollowUpDatumId: string) {
    return questionDatum.sectionRepetition === sectionRepetition &&
      questionDatum.followUpDatumId === sectionFollowUpDatumId
  }

  /**
   * Get an array of all of the condition tags for this location in the survey
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {Array}
   */
  public getAllConditionTagsForLocation (sectionRepetition: number, sectionFollowUpDatumId: string): ConditionTag[] {
    const tags = []
    for (let rct of this.conditionTags.respondent) {
      tags.push(this.conditionTagStore.getTagById(rct.conditionTagId))
    }
    for (let sct of this.conditionTags.survey) {
      tags.push(this.conditionTagStore.getTagById(sct.conditionId))
    }
    for (let sct of this.conditionTags.section) {
      if (sct.repetition === sectionRepetition &&
        sct.followUpDatumId === sectionFollowUpDatumId) {
        tags.push(this.conditionTagStore.getTagById(sct.conditionId))
      }
    }
    return tags
  }

  public getAllConditionTags (): ConditionTag[] {
    let tags: ConditionTag[] = this.conditionTags.respondent.map(rct => this.conditionTagStore.getTagById(rct.conditionTagId))
    tags = tags.concat(this.conditionTags.survey.map(sct => this.conditionTagStore.getTagById(sct.conditionId)))
    tags = tags.concat(this.conditionTags.section.map(sct => this.conditionTagStore.getTagById(sct.conditionId)))
    return tags
  }

  public getAllConditionTagNames (): string[] {
    return this.getAllConditionTags().map(tag => tag.name)
  }

  /**
   * Get an array of all the condition tag names for this location in the survey
   * @param sectionRepetition
   * @param sectionFollowUpDatumId
   * @returns {String[}
   */
  public getLocationConditionTagNames (sectionRepetition: number, sectionFollowUpDatumId: string): string[] {
    return this.getAllConditionTagsForLocation(sectionRepetition, sectionFollowUpDatumId).map(tag => tag.name)
  }

  /**
   * Get all of the data for thse
   * @param {Array} questionIds
   * @param {Number} sectionRepetition
   * @param {String} sectionFollowUpDatumId
   * @returns {Array}
   */
  getQuestionDataByIds (questionIds: string[], sectionRepetition: number, sectionFollowUpDatumId: string): QuestionDatum[] {
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
   * Search all of the condition tags to check if one currently exists
   * @param name
   * @param sectionRepetition
   * @param followUpDatumId
   */
  hasConditionTag (name: string, sectionRepetition: number, followUpDatumId: string): boolean {
    for (const tag of this.conditionTags[ConditionTagScope.RESPONDENT]) {
      if (tag.conditionTag && tag.conditionTag.name === name) {
        return true
      }
    }
    for (const tag of this.conditionTags[ConditionTagScope.SURVEY]) {
      if (tag.conditionTag && tag.conditionTag.name === name) {
        return true
      }
    }
    for (const tag of this.conditionTags[ConditionTagScope.SECTION]) {
      if (tag.repetition === sectionRepetition && tag.followUpDatumId === followUpDatumId) {
        return true
      }
    }
    return false
  }

}

/**
 * Make a deep copy of an object
 * @param json
 * @returns {object|array}
 */
export function copy (json: object) {
  return JSON.parse(JSON.stringify(json))
}
