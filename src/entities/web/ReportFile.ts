import { Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

export default class ReportFile extends TimestampedSoftDelete {
  @Serializable
  id: string
  @Serializable
  fileType: string
  @Serializable
  reportId: string
  @Serializable
  fileName: string
}
