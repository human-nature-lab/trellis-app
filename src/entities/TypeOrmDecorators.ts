import {
  PrimaryColumn as PC,
  PrimaryGeneratedColumn as PGC,
  Column as C,
  CreateDateColumn as CDC,
  UpdateDateColumn as UDC,
  Entity as E
} from 'typeorm'
import {camelToSnake} from "../services/JSONUtil";


function addColumnNameOverride (TypeOrmDecorator: Function) {
  return function (this: any, ...args) {
    let typeOrmColumnDecorator = TypeOrmDecorator(...args)
    return function (target: any, propertyKey: string, ...args: any[]) {
      if (!('__colNames__' in target)) {
        target.__colNames__ = []
      }
      if (!('__snakeNames__' in target)) {
        target.__snakeNames__ = []
      }
      target.__colNames__.push(propertyKey)
      target.__snakeNames__.push(camelToSnake(propertyKey))
      return typeOrmColumnDecorator(target, propertyKey, ...args)
    }
  }
}

export function AsDate (target: any, propertyKey: string) {
  if (!('__dates__' in target)) {
    target.__dates__ = []
  }
  target.__dates__.push(propertyKey)
}


export const Entity = E
export const Column = addColumnNameOverride(C)
export const PrimaryColumn = addColumnNameOverride(PC)
export const PrimaryGeneratedColumn = addColumnNameOverride(PGC)
export const CreateDateColumn = addColumnNameOverride(CDC)
export const UpdateDateColumn = addColumnNameOverride(UDC)
