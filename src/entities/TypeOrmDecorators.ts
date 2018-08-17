import {camelToSnake} from "../services/JSONUtil";

const columnMetaMap: Map<any, ColumnMeta> = new Map()

/**
 * The central location for all entity meta data created by the decorators defined in this file
 */
export interface ColumnMeta {
  names: string[],
  snake: string[],
  dates: string[]
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
      dates: []
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
