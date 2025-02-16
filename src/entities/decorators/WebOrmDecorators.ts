import { camelToSnake, getSnakeAssignmentFunc } from '../../services/JSONUtil'

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
  async?: boolean
}

/**
 * A function which assigns to the target values which are extracted from the source
 */
export interface AssignerFunction {
  (target: object, source: object): void
}


/**
 * Register this column as a date so that it can be transformed to and from a Date
 */
export function AsDate (target: any, propertyKey: string) {
  const columnMeta = getOrCreateMeta(target)
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
    const columnMeta = {
      names: [],
      snake: [],
      dates: [],
      relationships: new Map(),
      name: target.constructor.name
    }
    columnMetaMap.set(target.constructor.name, columnMeta)
    const con = target.__proto__.constructor
    const hasInheritedColumns = columnMetaMap.has(con.name)
    if (hasInheritedColumns) {
      const inheritedMeta = columnMetaMap.get(con.name)
      for (const key of ['names', 'snake', 'dates']){
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
 * @param {RelationshipOpts | Function} optsOrConstructorGenerator
 * @returns {(target: any) => void}
 * @constructor
 */
export function Relationship (optsOrConstructorGenerator: object | Function) {
  return function (target: any, propertyKey: string) {
    const columnMeta = getOrCreateMeta(target)
    if (typeof optsOrConstructorGenerator === 'object') {
      columnMeta.relationships.set(propertyKey, getSnakeAssignmentFunc(propertyKey, optsOrConstructorGenerator as RelationshipOpts))
    } else {
      columnMeta.relationships.set(propertyKey, getSnakeAssignmentFunc(propertyKey, {
        constructor: optsOrConstructorGenerator // Function that returns the constructor
      } as RelationshipOpts))
    }
  }
}


/**
 * Specify if a property is enumerable or not
 * @param {boolean} value
 * @returns {(target: any, propertyKey: string, descriptor: PropertyDescriptor) => void}
 */
export function enumerable (value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value
  }
}
