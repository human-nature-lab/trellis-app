import BaseEntity from '../base/BaseEntity'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'

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
  createdAt: Date

  @Serializable @AsDate
  updatedAt: Date
}
