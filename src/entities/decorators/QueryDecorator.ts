import {Repository} from "typeorm";

export interface QueryCallback<T> {
  (repo: Repository<T>): Promise<T|T[]>
}
// export function QueryRelationship (type: Function, queryCallback: QueryCallback<T>) {
//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     debugger
//   }
// }
