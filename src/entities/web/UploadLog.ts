import BaseEntity from '../base/BaseEntity'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'
import { Moment } from 'moment'

export default class UploadLog extends BaseEntity {
  @Serializable
  id: string
  @Serializable
  uploadId: string
  @Serializable
  tableName: string
  @Serializable
  operation: string
  @Serializable
  rowId: string
  @Serializable
  previousRow: string
  @Serializable
  updatedRow: string
  @Serializable @AsDate
  createdAt: Moment
  @Serializable @AsDate
  updatedAt: Moment

}
