import {isEqual} from 'lodash'
import {expect} from 'chai'
import moment from 'moment'

const timestamps = ['createdAt', 'updatedAt', 'deletedAt']
export const modifiers = {
  Interview (interview) {
    return strip(interview, timestamps)
  },
  User (user) {
    return strip(user, timestamps.concat(['password']))
  },
  Form (form) {
    return strip(form, timestamps.concat(['formMasterId', 'nameTranslationId']))
  },
  Translation (translation) {
    return strip(translation, timestamps)
  },
  TranslationText (tt) {
    return strip(tt, timestamps.concat(['translationId', 'locale']))
  },
  Survey (s) {
    return strip(s, ['password'])
  },
  Roster (r) {
    return strip(r, timestamps)
  },
  RespondentGeo (g) {
    return strip(g, timestamps.concat(['id']))
  },
  ConditionTag (c) {
    return strip(c, timestamps)
  }
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

function dateToStringIfDate (a) {
  if (moment.isMoment(a) || moment.isDate(a)) {
    return moment.utc(a).toISOString()
  } else {
    return a
  }
}

function modifyIfCustomModifier (a) {
  if (a && a.constructor && a.constructor.name && modifiers[a.constructor.name]) {
    return modifiers[a.constructor.name](a)
  } else {
    return a
  }
}

export function deepCompareEntities (a, b, keyTree = []) {
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
      deepCompareEntities(a[i], b[i], keyTree.concat(i))
    }
  } else if (typeof a === 'object') {
    a = modifyIfCustomModifier(a)
    b = modifyIfCustomModifier(b)
    expect(b).to.be.an('object', `b is not an object: ${keyTree.join('.')}`)
    if (a.constructor && a.constructor.name && comparitors[a.constructor.name]) {
      let compare = comparitors[a.constructor.name]
      compare(a, b)
    } else {
      let aKeys = Object.keys(a)
      let bKeys = Object.keys(b)
      for (let prop of aKeys) {
        if (bKeys.indexOf(prop) === -1) {
          throw new Error(`${prop} doesn't exist at ${keyTree.join('.')} on b, ${b.constructor.name}`)
        }
        deepCompareEntities(a[prop], b[prop], keyTree.concat(prop))
      }
      for (let prop of bKeys) {
        if (aKeys.indexOf(prop) === -1) {
          throw new Error(`${prop} doesn't exist at ${keyTree.join('.')} on a, ${a.constructor.name}`)
        }
        deepCompareEntities(a[prop], b[prop], keyTree.concat(prop))
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
