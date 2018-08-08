import _ from 'lodash'
import {AddedRemovedDelta, ConditionTagDelta, DataDelta, ModifiedDelta} from "../../../services/interview/InterviewDeltaInterface";
import QuestionDatum from "../../../entities/trellis/QuestionDatum";
export default class DiffService {
  /**
   * Take two maps and return their
   * @param {Map<string:object>} newObjMap
   * @param {Map<string:object>} oldObjMap
   * @param {Map<string:object>} comparisonKeys
   * @returns {{added: Array<object>, modified: Array<object>, removed: Array<object>}}
   */
  static mapDiffByKey (newObjMap: Map<string,object>, oldObjMap: Map<string,object>, comparisonKeys?: string[]|Set<string>) {
    let added = []
    let modified = []
    let removed = []
    comparisonKeys = comparisonKeys || new Set([...newObjMap.keys(), ...oldObjMap.keys()])
    let a
    let b
    for (let key of comparisonKeys) {
      if (newObjMap.has(key)) {
        if (!oldObjMap.has(key)) {
          added.push(newObjMap.get(key))
        } else {
          a = newObjMap.get(key)
          b = oldObjMap.get(key)
          if (!_.isEqual(a, b)) {
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
   * @param {object<interview.data>} newData
   * @param {object<interview.data>} oldData
   * @returns {{questionDatum: {added, modified, removed}|*, datum: {added, modified, removed}|*}}
   */
  static dataDiff (newData: QuestionDatum[], oldData: QuestionDatum[]) {
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

    const questionDatum = DiffService.mapDiffByKey(newQDatumMap, oldQDatumMap, [
      'questionId',
      'surveyId',
      'followUpDatumId',
      'sectionRepetition',
      'answeredAt',
      'skippedAt',
      'dkRf',
      'dkRfVal'
    ])
    const datum = DiffService.mapDiffByKey(newDatum, oldDatum)

    return new DataDelta(datum, questionDatum)

  }

  /**
   * Take two sets of conditions tags as defined on interview.conditionTags and compute which tags were added and which
   * condition tags were removed
   * @param {object} newTags
   * @param {object} oldTags
   * @returns {{respondent: {added, removed}, section: {added, removed}}
   */
  static conditionTagsDiff (newTags, oldTags) {
    // newTags = JSON.parse(JSON.stringify(newTags))
    // oldTags = JSON.parse(JSON.stringify(oldTags))

    let res = new ConditionTagDelta()
    for (let type of ['respondent', 'section', 'survey']) {
      let newConditionIds: Map<string, object> = new Map(newTags[type].map(tag => [tag.condition_id, tag]))
      let oldConditionIds: Map<string, object> = new Map(oldTags[type].map(tag => [tag.condition_id, tag]))

      let diff = DiffService.mapDiffByKey(newConditionIds, oldConditionIds)
      res[type] = new AddedRemovedDelta(diff.added, diff.removed)
    }
    return res
  }
}
