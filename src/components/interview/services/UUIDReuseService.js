import uuidv4 from 'uuid/v4'
export class UUIDReuseService {
  constructor (pairs = []) {
    this.usedMap = new Map(pairs)
  }

  /**
   * Return the previously generated uuid for the specified spot in the survey key if one exists. Otherwise generate it using the v4
   * specification
   * @param cacheKey
   * @returns {*}
   */
  get (cacheKey) {
    let uuid = this.usedMap.get(cacheKey)
    if (uuid === undefined || uuid === null) {
      uuid = uuidv4()
      this.usedMap.set(cacheKey, uuid)
    }
    return uuid
  }

  /**
   * Get a question datum uuid
   * @param location
   * @param questionId
   */
  getQuestionDatum (location, questionId) {
    return this.get(this.questionDatumKey(location, questionId))
  }

  /**
   * Get a datum uuid
   * @param questionDatumId
   * @param uniqueVal
   */
  getDatum (questionDatumId, uniqueVal) {
    return this.get(this.datumKey(questionDatumId, uniqueVal))
  }

  /**
   * Make the cache key for a question datum
   * @param location
   * @param questionId
   * @returns {string}
   */
  questionDatumKey (location, questionId) {
    return `qdatum-${location.section}-${location.page}-${location.sectionRepetition}-${location.sectionFollowUpRepetition}-${questionId}`
  }

  /**
   * Get the cache key for a datum
   * @param questionDatumId
   * @param uniqueVal
   * @returns {string}
   */
  datumKey (questionDatumId, uniqueVal) {
    return `datum-${questionDatumId}-${uniqueVal}`
  }

  /**
   * Get the condition cache key
   * @param location
   * @param type
   * @returns {string}
   */
  conditionKey (...args) {
    let key = 'condition'
    for (let arg of args) {
      key += '-' + arg
    }
    return key
  }

  /**
   * Get a conditionId
   * @param args
   * @returns {*}
   */
  getCondition (...args) {
    return this.get(this.conditionKey(...args))
  }

  /**
   * Set a value in the cache
   * @param cacheKey
   * @param val
   */
  set (cacheKey, val) {
    this.usedMap.set(cacheKey, val)
  }

  /**
   * Fill the cache with an array of key-values. Same structure as the default Map constructor
   * @param pairs
   */
  fill (pairs) {
    for (let pair of pairs) {
      this.usedMap.set(pair[0], pair[1])
    }
  }
}

export default new UUIDReuseService()
