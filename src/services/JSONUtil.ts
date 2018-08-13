/**
 * Convert a camel case string into snake case
 * @param {string} str
 * @returns {string}
 */
export function camelToSnake (str: string) {
  let snake = ''
  for (let char of str) {
    snake += char === char.toUpperCase() ? `_${char.toLowerCase()}` : char
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
 * Converts all properties to snake case and returns
 * @returns {object}
 */
export function toJSONSnake (obj: object) {
  const props = Object.getOwnPropertyNames(obj)
  let o = {}
  for (let prop of props) {
    let snake = camelToSnake(prop)
    o[snake] = obj[prop]
  }
  return JSON.stringify(o)
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
    for (let sourceKey of map) {
      let camel = snakeToCamel(sourceKey)
      target[camel] = source[sourceKey]
    }
  } else if (typeof map === 'object') {
    for (let sourceKey in map) {
      target[map[sourceKey]] = source[sourceKey]
    }
  } else {
    for (let sourceKey in source) {
      let camel = snakeToCamel(sourceKey)
      target[camel] = source[sourceKey]
    }
  }
}


/**
 * Create getters and setters for all properties defined on this object
 * @param {object} target
 */
export function createSnakeCaseAliases (target: object) {
  const props = Object.getOwnPropertyNames(target)
  for (let prop of props) {
    let snake = camelToSnake(prop)
    if (snake !== prop) {
      (camelCase => {
        Object.defineProperty(target, snake, {
          get() {
            return target[camelCase]
          },
          set (val) {
            target[camelCase] = val
          }
        })
      })(prop)
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
export function mapFromJSON (target: object, source: object, keyMap: object) {
  for (let targetKey in keyMap) {
    let sourceKey = camelToSnake(targetKey)
    let opts = keyMap[targetKey]
    let generator = s => new keyMap[targetKey]().fromJSON(s)
    if (typeof opts === 'object') {
      generator = opts.hasOwnProperty('constructor') ? s => {
        let d = new opts.constructor()
        return d.fromJSON ? d.fromJSON(s): d
      } : opts.generator
      if (opts.jsonKey) sourceKey = opts.sourceKey
    }
    if (source[sourceKey]) {
      if (Array.isArray(source[sourceKey])) {
        target[targetKey] = source[sourceKey].map(generator)
      } else {
        target[targetKey] = generator(source[sourceKey])
      }
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
      let d = {}
      if (Array.isArray(keyMap)) {
        for (let sourceKey of keyMap) {
          let targetKey = camelToSnake(sourceKey)
          d[targetKey] = mapCamelToPlain(source[sourceKey])
        }
      } else {
        for (let sourceKey in keyMap) {
          let targetKey = keyMap[sourceKey]
          d[targetKey] = mapCamelToPlain(source[sourceKey])
        }
      }
      return d
    }
  } else {
    return source
  }
}
