import {camelToSnake, getSnakeAssignmentFunc} from "../services/JSONUtil";

const columnMetaMap: Map<any, ColumnMeta> = new Map()

/**
 * The central location for all entity meta data created by the decorators defined in this file
 */
export interface ColumnMeta {
  names: string[]
  snake: string[]
  dates: string[]
  relationships: Map<string, AssignerFunction>
  name: string
}

/**
 * All options for the Relationship decorator
 */
export interface RelationshipOpts {
  generator? (json: any): any
  constructor? (): void
  jsonKey?: string
}

/**
 * A function which assigns to the target values which are extracted from the source
 */
export interface AssignerFunction {
  (target: object, source: object): void
}


/**
 * Register this column as a date so that it can be transformed to and from a Moment date object
 * @param target
 * @param {string} propertyKey
 * @constructor
 */
export function AsDate (target: any, propertyKey: string) {
  let columnMeta = getOrCreateMeta(target)
  columnMeta.dates.push(propertyKey)
}

/**
 * Returns a ColumnMeta object for the entity supplied
 * @param target
 * @returns {ColumnMeta}
 */
export function getColumnMeta (target: any): ColumnMeta {
  return columnMetaMap.get(target.constructor.name)
}

/**
 * Gets the existing ColumnMeta object if it exists or creates a new one
 * @param target
 * @returns {ColumnMeta}
 */
function getOrCreateMeta (target: any): ColumnMeta {
  if (columnMetaMap.has(target.constructor.name)) {
    return columnMetaMap.get(target.constructor.name)
  } else {
    let columnMeta = {
      names: [],
      snake: [],
      dates: [],
      relationships: new Map(),
      name: target.constructor.name
    }
    columnMetaMap.set(target.constructor.name, columnMeta)
    let con = target.__proto__.constructor
    let hasInheritedColumns = columnMetaMap.has(con.name)
    if (hasInheritedColumns) {
      let inheritedMeta = columnMetaMap.get(con.name)
      for (let key of ['names', 'snake', 'dates']){
        columnMeta[key].push(...inheritedMeta[key])
      }
    }
    return columnMeta
  }
}

/**
 * Registers this column in the ColumnMeta object for the entity. This is added to both the names and snake
 * arrays for serialization and deserialization.
 * @param target
 * @param {string} propertyKey
 * @returns {any}
 * @constructor
 */
export function Serializable (target: any, propertyKey: string): any {
  let columnMeta = getOrCreateMeta(target)
  let colNamesSet = new Set(columnMeta.names)
  let snakeNamesSet = new Set(columnMeta.snake)
  colNamesSet.add(propertyKey)
  snakeNamesSet.add(camelToSnake(propertyKey))
  columnMeta.names = Array.from(colNamesSet)
  columnMeta.snake = Array.from(snakeNamesSet)
}


/**
 * Define a relationship that will be automatically converted to the correct type via the default toSnakeJSON method
 * @param {RelationshipOpts | Function} optsOrConstructor
 * @returns {(target: any) => void}
 * @constructor
 */
export function Relationship (optsOrConstructor: object|Function) {
  return function (target: any, propertyKey: string) {
    let columnMeta = getOrCreateMeta(target)
    if (typeof optsOrConstructor === 'object') {
      columnMeta.relationships.set(propertyKey, getSnakeAssignmentFunc(propertyKey, optsOrConstructor as RelationshipOpts))
    } else {
      columnMeta.relationships.set(propertyKey, getSnakeAssignmentFunc(propertyKey, {
        constructor: optsOrConstructor
      } as RelationshipOpts))
    }
  }
}


/**
 * Specify if a property is enumerable or not
 * @param {boolean} value
 * @returns {(target: any, propertyKey: string, descriptor: PropertyDescriptor) => void}
 */
export function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
