import {Column} from 'typeorm'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import Timestamped from './Timestamped'
import MomentTransformer from "./MomentTransformer";
import {Moment} from "moment";

export default abstract class TimestampedSoftDelete extends Timestamped {
  @Column({ name: "deleted_at", type: "datetime", nullable: true, transformer: MomentTransformer })
  @AsDate
  @Serializable
  public deletedAt: Moment;
}
