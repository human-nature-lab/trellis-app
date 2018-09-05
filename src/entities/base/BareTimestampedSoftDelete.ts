import {Column} from 'typeorm'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import BareTimestamped from './BareTimestamped'

export default abstract class BareTimestampedSoftDelete extends BareTimestamped {
  @Column({ select: false, name: "deleted_at", type: "datetime", nullable: true })
  @AsDate
  @Serializable
  public deletedAt: Date
}
