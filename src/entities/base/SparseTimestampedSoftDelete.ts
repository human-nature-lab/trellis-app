import {Column} from 'typeorm'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestamped from './SparseTimestamped'

export default abstract class SparseTimestampedSoftDelete extends SparseTimestamped {
  @Column({type: "datetime", nullable: true }) @AsDate @Serializable
  public deletedAt: Date
}
