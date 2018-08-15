import {parseDate} from '../../services/DateService'
import SnakeSerializable from "../interfaces/SnakeSerializable";

export default class BaseEntity implements SnakeSerializable {
  protected __dates__: string[]
  protected __colNames__: string[]
  protected __snakeNames__: string[]

  /**
   * Just pars all of the dates defined in the model's __dates__ array
   */
  protected parseDates () {
    for (let key of this.__dates__) {
      if (key in this) {
        this[key] = parseDate(this[key]) // This returns a moment object which will automatically be serialized correctly
      }
    }
  }

  /**
   * Return a JSON.stringify-able object that excludes relationships by default
   */
  toJSON (): object {
    let r = {}
    for (let key of this.__colNames__) {
      r[key] = this[key]
    }
    return r
  }

  /**
   * Default behavior is to just assign only column names without copying any relationships that may be defined
   * @param json
   */
  fromJSON (json: object): this {
    for (let key of this.__colNames__) {
      this[key] = json[key]
    }
    return this
  }

  /**
   * Default fromSnakeJSON will only assign properties defined with Column type decorators. See TypeOrmDecorators.ts
   * for implementation details.
   * @param json
   */
  fromSnakeJSON (json: any): this {
    for (let i = 0; i < this.__colNames__.length; i++) {
      if (this.__snakeNames__[i] in json) {
        this[this.__colNames__[i]] = json[this.__snakeNames__[i]]
      }
    }
    this.parseDates()
    return this
  }

  /**
   * Map all camel case column names to the equivalent snake case name and return a plain object
   */
  toSnakeJSON (): object {
    let r = {}
    for (let i = 0; i < this.__colNames__.length; i++) {
      r[this.__snakeNames__[i]] = this[this.__colNames__[i]]
    }
    return r
  }

  /**
   * Default copy method is to call JSON.parse(JSON.stringify(this)) and then use the fromJSON method to correctly
   * assign the props
   */
  copy () {
    const constructor: any = this.constructor
    return new constructor().fromJSON(JSON.parse(JSON.stringify(this)))
  }

}
