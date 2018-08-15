import {AsDate, Column} from '../TypeOrmDecorators'
import Timestamped from './Timestamped'

export default abstract class TimestampedSoftDelete extends Timestamped {
  @Column({ name: "deleted_at", type: "datetime", nullable: true }) @AsDate
  deletedAt: Date = null;

}
