import {Column} from 'typeorm'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestamped from './SparseTimestamped'
import MomentTransformer from "./MomentTransformer";
import {Moment} from "moment";

export default abstract class SparseTimestampedSoftDelete extends SparseTimestamped {
  @Column({type: "datetime", nullable: true, transformer: MomentTransformer }) @AsDate @Serializable
  public deletedAt: Moment
}
