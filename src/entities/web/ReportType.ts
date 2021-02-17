import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

export class ReportType extends TimestampedSoftDelete {
  @Serializable
  name: string
  @Serializable
  filename?: string
  @Serializable
  type: string
  @Serializable
  configSchema: any 
}