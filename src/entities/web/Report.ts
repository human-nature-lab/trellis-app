import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ReportFile from './ReportFile'

export default class Report extends TimestampedSoftDelete {
  @Serializable
  id: string
  @Serializable
  type: string
  @Serializable
  formId?: string
  @Serializable
  studyId: string
  @Serializable
  status: string

  @Relationship(type => ReportFile)
  files: ReportFile[]

}
