import {parseDate} from '../../services/DateService'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {getColumnMeta} from '../decorators/WebOrmDecorators'
import {camelToSnake, deepCopy} from '../../services/JSONUtil'

interface toSnakeJSONOpts {
  includeRelationships?: boolean
  removeUndefined?: boolean
}

export default class BaseEntity implements SnakeSerializable {

  /**
   * Just parse all of the dates defined in the model's __dates__ array
   */
  protected parseDates () {
    for (let key of getColumnMeta(this).dates) {
      if (key in this && this[key]) {
        this[key] = parseDate(this[key]) // This returns a moment object which will automatically be serialized correctly
      }
    }
    return this
  }

  /**
   * Map all relationships defined using the Relationship decorator
   * @param json
   * @returns {this}
   */
  protected mapRelationships (json: any) {
    let relationships = getColumnMeta(this).relationships
    for (let o of relationships) {
      let [key, assigner] = o
      assigner(this, json)
    }
    return this
  }

  protected mapColumns (json: any) {
    for (let key of getColumnMeta(this).names) {
      this[key] = json[key]
    }
    return this
  }

  /**
   * Return a JSON.stringify-able object with relationshiops
   */
  // toJSON (): object {
  //   // let r = {}
  //   // const meta = getColumnMeta(this)
  //   // for (let key of meta.names) {
  //   //   r[key] = this[key]
  //   // }
  //   // for (let o of meta.relationships) {
  //   //   let [key, _] = o
  //   //   r[key] = Array.isArray(this[key]) ? this[key].map(b => b.toJSON()) : this[key].toJSON()
  //   // }
  //   // return r
  //   return this
  // }

  /**
   * Default fromSnakeJSON will only assign properties defined with Column type decorators. See WebOrmDecorators.ts
   * for implementation details.
   * @param json
   */
  fromSnakeJSON (json: any): this {
    if (!json) {
      console.log('JSON undefined', this, json)
      return null
    }
    let colMeta = getColumnMeta(this)
    for (let i = 0; i < colMeta.names.length; i++) {
      if (colMeta.snake[i] in json) {
        this[colMeta.names[i]] = json[colMeta.snake[i]]
      }
    }
    this.mapRelationships(json)
    this.parseDates()
    return this
  }

  /**
   * Map all camel case column names to the equivalent snake case name and return a plain object
   */
  toSnakeJSON (opts: toSnakeJSONOpts = {includeRelationships: false}): object {
    const colMeta = getColumnMeta(this)
    const r = {}
    for (let i = 0; i < colMeta.names.length; i++) {
      const key = colMeta.names[i]
      const snakeKey = colMeta.snake[i]
      r[snakeKey] = this[key]
    }
    if (opts.includeRelationships) {
      for (let o of colMeta.relationships) {
        const [key, _] = o
        const snakeKey = camelToSnake(key)
        if (this[key] == null) {
          r[snakeKey] = this[key]
        } else if (Array.isArray(this[key])) {
          r[snakeKey] = this[key].map(o => o.toSnakeJSON(opts))
        } else if (typeof this[key] === 'object' && 'toSnakeJSON' in this[key]) {
          r[snakeKey] = this[key].toSnakeJSON(opts)
        } else {
          r[snakeKey] = this[key]
        }
      }
    }
    return r
  }

  /**
   * The default strategy for returning a cloned object.
   */
  copy () {
    return deepCopy(this)
  }
  // copy () {
  //   const colMeta = getColumnMeta(this)
  //   // @ts-ignore
  //   const clone = new this.constructor()
  //   for (let key of colMeta.names) {
  //     if (this.hasOwnProperty(key)) {
  //       if (Array.isArray(this[key])) {
  //         clone[key] = this[key].map(o => o.copy())
  //       } else if (moment.isMoment(this[key]) || moment.isDate(this[key])) {
  //         clone[key] = moment(this[key])
  //       } else if (typeof this[key] === 'object') {
  //         if ('copy' in this[key]) {
  //           clone[key] = this[key].copy()
  //         } else {
  //           clone[key] = deepCopy(this[key])
  //         }
  //       }
  //     }
  //   }
  //   return clone
  // }

}
