import {CreateDateColumn, UpdateDateColumn} from 'typeorm'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import BaseEntity from './BaseEntity'
import MomentTransformer from "./MomentTransformer";
import {Moment} from "moment";

export default abstract class Timestamped extends BaseEntity {
  @CreateDateColumn({ type: 'datetime', transformer: MomentTransformer }) @AsDate @Serializable
  public createdAt: Moment

  @UpdateDateColumn({ type: 'datetime', transformer: MomentTransformer }) @AsDate @Serializable
  public updatedAt: Moment
}
