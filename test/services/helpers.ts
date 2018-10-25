import {expect} from 'chai'
import moment from 'moment'
import SparseTimestamped from "../../src/entities/base/SparseTimestamped";
import SparseTimestampedSoftDelete from "../../src/entities/base/SparseTimestampedSoftDelete";

export const timestamps = ['createdAt', 'updatedAt', 'deletedAt']

function removeTimestampsIfSparse (o) {
  return o instanceof SparseTimestamped || o instanceof SparseTimestampedSoftDelete ? strip(o, timestamps) : o
}

// These mutators are run anytime a matching entity is found with the deepCompareEntities method
export const globalMutators = {
  User: user => strip(user, timestamps.concat(['password'])),
  Form: form => strip(form, timestamps.concat(['formMasterId', 'nameTranslationId'])),
  TranslationText: tt => strip(tt, timestamps.concat(['translationId', 'locale'])),
  QuestionChoice: q => strip(q, ['questionId', 'choiceId']),
  Survey: s => strip(s, ['password']),
  RespondentGeo: g => strip(g, timestamps.concat(['id'])),
  FormSection: f => strip(f, ['formId', 'sectionId']),
  Section: s => strip(s, ['nameTranslationId'])
}

export const comparitors = {}

export function strip (o, keys) {
  for (let key of keys) {
    delete o[key]
  }
  return o
}

export const idSort = (one, two) => one.id.localeCompare(two.id)

export function j (o) {
  return JSON.parse(JSON.stringify(o))
}

export function isSorted (vals, sortValueExtractor, ascending = true) {
  if (vals.length <= 1) return true
  for (let i = 1; i < vals.length; i++) {
    let prevSortVal = sortValueExtractor(vals[i - 1])
    let sortVal = sortValueExtractor(vals[i])
    if (ascending) {
      if (sortVal < prevSortVal) {
        return false
      }
    } else {
      if (sortVal > prevSortVal) {
        return false
      }
    }
  }
  return true
}

function dateToStringIfDate (a) {
  if (moment.isMoment(a) || moment.isDate(a)) {
    return moment.utc(a).toISOString()
  } else {
    return a
  }
}

function modifyIfCustomModifier (a, mutators = {}) {
  a = removeTimestampsIfSparse(a)
  if (a && a.constructor && a.constructor.name) {
    let n = a.constructor.name
    if (mutators[n]) {
      a = mutators[n](a)
    }
    if (globalMutators[n]) {
      a = globalMutators[n](a)
    }
  }
  return a
}

/**
 *
 * @param a
 * @param b
 * @param {{}} localMutators
 * @param {{}} localComparitors
 * @param {any[]} keyTree
 * @returns {any}
 */
export function deepCompareEntities (a, b, localMutators = {}, localComparitors = {}, keyTree = []) {
  if (a === b) return true
  a = dateToStringIfDate(a)
  b = dateToStringIfDate(b)
  if (a === null || b === null) {
    return expect(a).to.equal(b, `Objects are not equal: ${keyTree.join('.')}`)
  } else if (Array.isArray(a)) {
    expect(b).to.be.an('array', `b is not an array: ${keyTree.join('.')}`)
    a.sort(idSort)
    b.sort(idSort)
    expect(a.length).to.equal(b.length, `Arrays aren't the same length ${keyTree.join('.')}`)
    for (let i = 0; i < a.length; i++) {
      deepCompareEntities(a[i], b[i], localMutators, localComparitors, keyTree.concat(i))
    }
  } else if (typeof a === 'object') {
    expect(b).to.be.an('object', `b is not an object: ${keyTree.join('.')}`)
    a = modifyIfCustomModifier(a, localMutators)
    b = modifyIfCustomModifier(b, localMutators)
    let comparitor
    if (a.constructor && a.constructor.name) {
      comparitor = localComparitors[a.constructor.name] || comparitors[a.constructor.name] || null
    }
    if (comparitor) {
      comparitor(a, b)
    } else {
      let aKeys = Object.keys(a)
      let bKeys = Object.keys(b)
      for (let prop of aKeys) {
        if (bKeys.indexOf(prop) === -1) {
          throw new Error(`${prop} doesn't exist at ${keyTree.join('.')} on b, ${b.constructor.name}`)
        }
        deepCompareEntities(a[prop], b[prop], localMutators, comparitors, keyTree.concat(prop))
      }
      for (let prop of bKeys) {
        if (aKeys.indexOf(prop) === -1) {
          throw new Error(`${prop} doesn't exist at ${keyTree.join('.')} on a, ${a.constructor.name}`)
        }
        deepCompareEntities(a[prop], b[prop], localMutators, comparitors, keyTree.concat(prop))
      }
    }
  } else {
    expect(a).to.be.equal(b, `Values are not the same > ${keyTree.join('.')}`)
  }
}

export function expectToHaveProperties(obj, props, errMsg = null) {
  for (let key of props) {
    expect(obj, `expected ${obj.constructor.name} to have ${key} defined`).to.have.property(key)
  }
}
