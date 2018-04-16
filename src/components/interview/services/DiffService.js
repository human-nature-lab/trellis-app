import _ from 'lodash'
export default class DiffService {
  /**
   * Take two maps and return their
   * @param {Map<string:object>} newObjMap
   * @param {Map<string:object>} oldObjMap
   * @returns {{added: Array<object>, modified: Array<object>, removed: Array<object>}}
   */
  static mapDiffByKey (newObjMap, oldObjMap) {
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
          if (!_.isEqual(a, b)) {
            modified.push(a)
          }
        }
      } else if (oldObjMap.has(key)) {
        removed.push(oldObjMap.get(key))
      }
    }
    return { added, modified, removed }
  }

  /**
   * Take two questionDatum structures as defined on the interview model and compute the added, removed and modified
   * objects for both the question datum and their datum
   * @param {object<interview.data>} newData
   * @param {object<interview.data>} oldData
   * @returns {{questionDatum: {added, modified, removed}|*, datum: {added, modified, removed}|*}}
   */
  static dataDiff (newData, oldData) {
    newData = JSON.parse(JSON.stringify(newData))
    oldData = JSON.parse(JSON.stringify(oldData))

    let newDatum = new Map()
    let oldDatum = new Map()

    let newQDatumMap = new Map(newData.map(q => {
      for (let d of q.datum) {
        newDatum.set(d.id, d)
      }
      delete q.data
      delete q.datum
      return [q.id, q]
    }))
    let oldQDatumMap = new Map(oldData.map(q => {
      for (let d of q.datum) {
        oldDatum.set(d.id, d)
      }
      delete q.data
      delete q.datum
      return [q.id, q]
    }))

    const questionDatum = DiffService.mapDiffByKey(newQDatumMap, oldQDatumMap)
    const datum = DiffService.mapDiffByKey(newDatum, oldDatum)

    return {
      questionDatum,
      datum
    }
  }

  /**
   * Take two sets of conditions tags as defined on interview.conditionTags and compute which tags were added and which
   * condition tags were removed
   * @param {object} newTags
   * @param {object} oldTags
   * @returns {{respondent: {added, removed}, section: {added, removed}}
   */
  static conditionTagsDiff (newTags, oldTags) {
    newTags = JSON.parse(JSON.stringify(newTags))
    oldTags = JSON.parse(JSON.stringify(oldTags))

    let res = {}
    for (let type of ['respondent', 'section', 'form']) {
      let newConditionIds = new Map(newTags[type].map(tag => [tag.condition_id, tag]))
      let oldConditionIds = new Map(oldTags[type].map(tag => [tag.condition_id, tag]))

      let diff = DiffService.mapDiffByKey(newConditionIds, oldConditionIds)
      delete diff.modified
      res[type] = diff
    }
    return res
  }
}
