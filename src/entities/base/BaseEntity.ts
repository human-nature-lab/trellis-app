import {parseDate} from '../../services/DateService'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {getColumnMeta} from '../decorators/WebOrmDecorators'
import {deepCopy, camelToSnake} from '../../services/JSONUtil'
import {AfterInsert, AfterLoad, AfterRemove, AfterUpdate} from 'typeorm'
import UpdatedRecords from '../trellis-config/UpdatedRecords'

export default class BaseEntity implements SnakeSerializable {
  /**
   * After the entity loads parse the dates into Moment objects
   */
  @AfterLoad()
  whenLoad() {
    this.parseDates()
  }

  @AfterUpdate()
  async whenUpdate() {
    console.log('whenUpdate', this)
    // Requiring DatabaseService to break circular dependency issue when importing
    const DatabaseService = require('../../services/database/DatabaseService').default
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(UpdatedRecords)
    const updatedRecord = new UpdatedRecords()
    console.log('this.constructor.name', this.constructor.name)
    console.log('camelToSnake(this.constructor.name)', camelToSnake(this.constructor.name))
    updatedRecord.table = camelToSnake(this.constructor.name)
    updatedRecord.updatedRecordId = this['id']
    updatedRecord.isUpdate = true
    repository.save(updatedRecord)
  }

  @AfterRemove()
  async whenRemove() {
    console.log('whenRemove', this)
    const DatabaseService = require('../../services/database/DatabaseService').default
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(UpdatedRecords)
    const updatedRecord = new UpdatedRecords()
    console.log('this.constructor.name', this.constructor.name)
    console.log('camelToSnake(this.constructor.name)', camelToSnake(this.constructor.name))
    updatedRecord.table = camelToSnake(this.constructor.name)
    updatedRecord.updatedRecordId = this['id']
    updatedRecord.isRemove = true
    repository.save(updatedRecord)
  }

  @AfterInsert()
  async whenInsert() {
    console.log('whenInsert', this)
    const DatabaseService = require('../../services/database/DatabaseService').default
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(UpdatedRecords)
    const updatedRecord = new UpdatedRecords()
    console.log('this.constructor.name', this.constructor.name)
    console.log('camelToSnake(this.constructor.name)', camelToSnake(this.constructor.name))
    updatedRecord.table = camelToSnake(this.constructor.name)
    updatedRecord.updatedRecordId = this['id']
    updatedRecord.isInsert = true
    repository.save(updatedRecord)
  }

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
  toSnakeJSON (): object {
    let colMeta = getColumnMeta(this)
    let r = {}
    for (let i = 0; i < colMeta.names.length; i++) {
      r[colMeta.snake[i]] = this[colMeta.names[i]]
    }
    return r
  }

  /**
   * The default strategy for returning a cloned object.
   */
  copy () {
    return deepCopy(this)
  }

}
