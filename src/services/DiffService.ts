import {AddedRemovedDelta, ConditionTagDelta, DataDelta, ModifiedDelta} from './interview/InterviewDeltaInterface'
import QuestionDatum from '../entities/trellis/QuestionDatum'
import SectionConditionTag from "../entities/trellis/SectionConditionTag";
import SurveyConditionTag from "../entities/trellis/SurveyConditionTag";
import RespondentConditionTag from "../entities/trellis/RespondentConditionTag";
import {ConditionTagInterface} from "./interview/InterviewDataInterface";
import * as Moment from 'moment'
import union from 'lodash/union'
export default class DiffService {
  /**
   * Take two maps and return their
   * @param {Map<string:object>} newObjMap
   * @param {Map<string:object>} oldObjMap
   * @param {Map<string:object>} comparisonKeys
   * @returns {{added: Array<object>, modified: Array<object>, removed: Array<object>}}
   */
  static mapDiffByKey (newObjMap: Map<string, any>, oldObjMap: Map<string, any>, comparisonKeys?: string[]): ModifiedDelta<any> {
    let added = []
    let modified = []
    let removed = []
    let allKeys = new Set([...newObjMap.keys(), ...oldObjMap.keys()])
    let a
    let b
    for (let key of allKeys) {
      if (newObjMap.has(key)) {
        if (!oldObjMap.has(key)) {
          added.push(newObjMap.get(key))
        } else {
          a = newObjMap.get(key)
          b = oldObjMap.get(key)

          if (!DiffService.isEqualKeys(a, b, comparisonKeys)) {
            modified.push(a)
          }
        }
      } else if (oldObjMap.has(key)) {
        removed.push(oldObjMap.get(key))
      }
    }
    return new ModifiedDelta(added, removed, modified)
  }

  /**
   * Take two questionDatum structures as defined on the interview model and compute the added, removed and modified
   * objects for both the question datum and their datum
   * @param {QuestionDatum[]} newData
   * @param {QuestionDatum[]} oldData
   * @returns {DataDelta}
   */
  static dataDiff (newData: QuestionDatum[], oldData: QuestionDatum[]): DataDelta {
    // newData = JSON.parse(JSON.stringify(newData))
    // oldData = JSON.parse(JSON.stringify(oldData))

    let newDatum = new Map()
    let oldDatum = new Map()

    let newQDatumMap = new Map()
    for (let q of newData) {
      for (let d of q.data) {
        newDatum.set(d.id, d)
      }
      newQDatumMap.set(q.id, q)
    }
    let oldQDatumMap = new Map()
    for (let q of oldData) {
      for (let d of q.data) {
        oldDatum.set(d.id, d)
      }
      oldQDatumMap.set(q.id, q)
    }

    const questionDatum = DiffService.mapDiffByKey(newQDatumMap, oldQDatumMap)
    const datum = DiffService.mapDiffByKey(newDatum, oldDatum)

    return new DataDelta(datum, questionDatum)

  }

  /**
   * Take two sets of conditions tags as defined on interview.conditionTags and compute which tags were added and which
   * condition tags were removed
   * @param {ConditionTagInterface} newTags
   * @param {ConditionTagInterface} oldTags
   * @returns {ConditionTagDelta}
   */
  static conditionTagsDiff (newTags: ConditionTagInterface, oldTags: ConditionTagInterface): ConditionTagDelta {
    // newTags = JSON.parse(JSON.stringify(newTags))
    // oldTags = JSON.parse(JSON.stringify(oldTags))

    let res = new ConditionTagDelta()
    for (let type of ['respondent', 'section', 'survey']) {
      let newConditionIds: Map<string, object> = new Map(newTags[type].map((tag: RespondentConditionTag|SurveyConditionTag|SectionConditionTag) => [tag.conditionId, tag]))
      let oldConditionIds: Map<string, object> = new Map(oldTags[type].map((tag: RespondentConditionTag|SurveyConditionTag|SectionConditionTag) => [tag.conditionId, tag]))

      let diff = DiffService.mapDiffByKey(newConditionIds, oldConditionIds)
      res[type] = new AddedRemovedDelta(diff.added, diff.removed)
    }
    return res
  }

  /**
   * Compare two objects by checking the array of keys given for referential equality
   * @param {object} one
   * @param {object} two
   * @param {string[]} keys
   * @returns {boolean}
   */
  static isEqualKeys (one: object, two: object, keys?: string[]) {
    if (!keys) {
      keys = union(Object.keys(one), Object.keys(two))
    }
    for (let key of keys) {
      let isSame = true
      if (Moment.isMoment(one[key])) {
        isSame = one[key].isSame(two[key])
      } else if (one[key] === null || one[key] === undefined) {
        // Behave as though null === undefined
        isSame = two[key] === null || two[key] === undefined
      } else if ((!Array.isArray(one[key]) && typeof one[key] !== 'object')) {
        isSame = one[key] === two[key]
      }
      if (!isSame) {
        return false
      }
    }
    return true
  }

  /**
   * Returns true if a diff has actual values
   * @param obj
   */
  static hasChanges (obj: object): boolean {
    if (!obj) return false
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if ((Array.isArray(obj[key]) && obj[key].length > 0) || DiffService.hasChanges(obj[key])) {
          return true
        }
      }
    }
    return false
  }
}
