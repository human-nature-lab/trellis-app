// Taken from https://gist.github.com/recurrence/b6a4cb04a8ddf42eda4e4be520921bd2
import { NamingStrategyInterface, DefaultNamingStrategy } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

const cache: Map<string, string> = new Map()
function snakeCaseCached (name) {
  let result = cache.get(name)
  if (result === null || result === undefined) {
    result = snakeCase(name)
    cache.set(name, result)
  }
  return result
}

export default class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCaseCached(className)
  }

  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCaseCached(embeddedPrefixes.join('_')) + (customName ? customName : snakeCaseCached(propertyName))
  }

  relationName(propertyName: string): string {
    return snakeCaseCached(propertyName)
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCaseCached(relationName + "_" + referencedColumnName)
  }

  joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
    return snakeCaseCached(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName)
  }

  joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    return snakeCaseCached(tableName + "_" + (columnName ? columnName : propertyName))
  }

  classTableInheritanceParentColumnName(parentTableName: any, parentTableIdPropertyName: any): string {
    return snakeCaseCached(parentTableName + "_" + parentTableIdPropertyName)
  }
}
