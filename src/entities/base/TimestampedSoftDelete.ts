import {Column} from 'typeorm'
import {AsDate, Serializable} from '../WebOrmDecorators'
import Timestamped from './Timestamped'

export default abstract class TimestampedSoftDelete extends Timestamped {
  @Column({ name: "deleted_at", type: "datetime", nullable: true })
  @AsDate
  @Serializable
  public deletedAt: Date = null;

}
