import {camelToSnake} from "../services/JSONUtil";

const columnMetaMap: Map<any, ColumnMeta> = new Map()

export interface ColumnMeta {
  names: string[],
  snake: string[],
  dates: string[]
}


export function AsDate (target: any, propertyKey: string) {
  let columnMeta = getMeta(target)
  columnMeta.dates.push(propertyKey)
}

export function getColumnMeta (target: any): ColumnMeta {
  return columnMetaMap.get(target.constructor.name)
}

function getMeta (target: any): ColumnMeta {
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

export function Serializable (target: any, propertyKey: string): any {
  let columnMeta = getMeta(target)
  let colNamesSet = new Set(columnMeta.names)
  let snakeNamesSet = new Set(columnMeta.snake)
  colNamesSet.add(propertyKey)
  snakeNamesSet.add(camelToSnake(propertyKey))
  columnMeta.names = Array.from(colNamesSet)
  columnMeta.snake = Array.from(snakeNamesSet)
}
