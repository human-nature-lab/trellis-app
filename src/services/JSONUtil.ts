import { AssignerFunction, RelationshipOpts } from '../entities/decorators/WebOrmDecorators'
import { copyDate } from './DateService'
import { isUndefined } from './util'
import { isDate } from 'date-fns'

/**
 * Convert a camel case string into snake case
 * @param {string} str
 * @returns {string}
 */
export function camelToSnake (str: string) {
  let snake = ''
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    // Indicates if the character is uppercase and part of the alphabet eg. A-Z and not a special character or number
    const isUpperAlpha = char === char.toUpperCase() && char !== char.toLowerCase()
    snake += isUpperAlpha ? ((i > 0) ? `_${char.toLowerCase()}` : `${char.toLowerCase()}`) : char
  }
  return snake
}

/**
 * Convert a snake case string into camel case
 * @param {string} str
 * @returns {string}
 */

export function snakeToCamel (str: string) {
  const sections = str.split('_')
  return sections.map((s, i) => {
    if (i) {
      return s[0].toUpperCase() + s.substr(1) // Make first letter uppercase
    }
    return s
  }).join('')
}

/**
 * Take a generic object and assign all properties to this object using camel case property names. If the map is an
 * object, then the key is the sourceKey and the value is the targetKey. If the map is an array, then each value is
 * assumed to be the sourceKey and the
 * @param {object} target
 * @param {object} source
 * @param {object | string[]} map
 */
export function mapPropsFromJSON (target: object, source: object, map?: object | string[]) {
  if (Array.isArray(map)) {
    for (const sourceKey of map) {
      const camel = snakeToCamel(sourceKey)
      target[camel] = source[sourceKey]
    }
  } else if (typeof map === 'object') {
    for (const sourceKey in map) {
      target[map[sourceKey]] = source[sourceKey]
    }
  } else {
    for (const sourceKey in source) {
      const camel = snakeToCamel(sourceKey)
      target[camel] = source[sourceKey]
    }
  }
}

/**
 * Take a snake key for the json source and apply it to the target (in camel case) if the property is defined. If the
 * the source is an Array, the map method will be used to map each member of the array to the appropriate class.
 * @param {object} target
 * @param {object} source
 * @param {object} keyMap
 */
export function mapFromSnakeJSON (target: object, source: object, keyMap: object) {
  for (const targetKey in keyMap) {
    const opts = keyMap[targetKey] as RelationshipOpts
    getSnakeAssignmentFunc(targetKey, opts)(target, source)
  }
}

/**
 * Create a function which will assign the relationship to the source object when it is called
 * @param {string} sourceKey
 * @param {string} targetKey
 * @param {RelationshipOpts} opts
 * @returns {AssignerFunction}
 */
export function getSnakeAssignmentFunc (targetKey: string, opts: RelationshipOpts): AssignerFunction {
  function assign (key: string, to: object, value: any): void {
    if (typeof opts === 'object' && opts.async) {
      Object.defineProperty(to, key, {
        get () {
          return new Promise(resolve => resolve(value))
        },
      })
    } else {
      to[key] = value
    }
  }

  /**
   * This function takes the possible arguments for the "Relationship" decorator and converts them into a 'generator'
   * function which actually performs the unmarshalling.
   */
  return function Assigner (to, from) {
    let generator
    let sourceKey = camelToSnake(targetKey)
    if (typeof opts === 'object') {
      generator = opts.hasOwnProperty('constructor')
        ? s => {
          const constructor = opts.constructor()
          // @ts-ignore
          const d = new constructor()
          return d.fromSnakeJSON ? d.fromSnakeJSON(s) : d
        }
        : opts.generator
      if (opts.jsonKey) sourceKey = opts.jsonKey
    } else if (typeof opts === 'function') {
      // @ts-ignore
      generator = s => new opts().fromSnakeJSON(s)
    }
    if (from[sourceKey] !== null && from[sourceKey] !== undefined) {
      assign(targetKey, to, Array.isArray(from[sourceKey]) ? from[sourceKey].map(generator) : generator(from[sourceKey]))
    }
  }
}

/**
 * Map an objects camel case properties to a plain object using snake case
 * @param {object} source
 * @param {string[] | object} keyMap
 * @returns {object}
 */
export function mapCamelToPlain (source: any, skipSnakeJSON = false, keyMap?: string[]|object): object {
  if (source == null) return null
  keyMap = keyMap || Array.from(Object.keys(source))
  if (Array.isArray(source)) {
    return source.map(o => mapCamelToPlain(o))
  } else if (typeof source === 'object') {
    if (!skipSnakeJSON && 'toSnakeJSON' in source) {
      return source.toSnakeJSON()
    } else if ('toJSON' in source) {
      return source.toJSON()
    } else {
      const d = {}
      if (Array.isArray(keyMap)) {
        for (const sourceKey of keyMap) {
          const targetKey = camelToSnake(sourceKey)
          d[targetKey] = mapCamelToPlain(source[sourceKey])
        }
      } else {
        for (const sourceKey in keyMap) {
          const targetKey = keyMap[sourceKey]
          d[targetKey] = mapCamelToPlain(source[sourceKey])
        }
      }
      return d
    }
  } else {
    return source
  }
}

/**
 * Recursive, deep copy of any object
 * @param obj
 * @returns {any}
 */
export function deepCopy (obj: any, copySelf = false): any {
  if (isUndefined(obj)) {
    return obj
  } else if (Array.isArray(obj)) {
    return obj.map(o => deepCopy(o, true))
  } else if (isDate(obj)) {
    return copyDate(obj)
  } else if (typeof obj === 'object') {
    if (obj.copy && copySelf) {
      return obj.copy()
    } else if (obj.constructor) {
      let d
      // Try using the constructor. This will fail if the constructor requires arguments
      try {
        d = new obj.constructor()
      } catch (err) {
        d = {}
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          d[key] = deepCopy(obj[key], true)
        }
      }
      return d
    } else {
      return Object.assign({}, obj)
    }
  } else {
    return obj
  }
}

/**
 * Get a value using "dot" access for a JSON object.
 * @param obj
 * @param key
 * @param val
 */
export function getDot (obj: object, key: string) {
  const parts = key.split('.')
  let ref = obj
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i]
    if (typeof ref === 'object' && key in ref) {
      ref = ref[key]
    } else if (ref[key] === undefined) {
      return
    }
  }
  return ref
}

/**
 * Enable "dot" access to nested values in a JSON object.
 * @param obj
 * @param key
 * @param val
 */
export function setDot (obj: object, key: string, val: any, setter?: (obj: object, key: string, val: any) => void) {
  const parts = key.split('.')
  let ref = obj
  let i
  for (i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (typeof ref === 'object') {
      if (key in ref) {
        ref = ref[key]
      } else {
        if (setter) {
          setter(ref, key, {})
        } else {
          ref[key] = {}
        }
        ref = ref[key]
      }
    } else {
      throw Error('invalid dot access')
    }
  }
  if (typeof ref === 'object') {
    if (setter) {
      setter(ref, parts[i], val)
    } else {
      ref[parts[i]] = val
    }
  }
}

export function safeParse (str: string, reviver?: (this: any, key: string, val: any) => any): object | string {
  try {
    return JSON.parse(str, reviver)
  } catch (err) {
    return str
  }
}

type HashTable = {[key: string]: any}

export function copyWhitelist<T extends HashTable> (obj: {[key: keyof T]: any}, whitelist?: (keyof T)[]): HashTable {
  if (!obj) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(o => deepCopy(o))
  } else if (typeof obj === 'object') {
    const r: HashTable = {}
    for (const key in obj) {
      if (obj[key] && whitelist && whitelist.indexOf(key) > -1) {
        const o = deepCopy(obj[key])
        // Filter empty objects
        if (typeof o !== 'object' || Object.keys(o).length) {
          r[key] = o
        }
      }
    }
    return r
  } else {
    return JSON.parse(JSON.stringify(obj))
  }
}
