import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from '../base/BaseEntity'
import { ActionPayload } from '../../components/interview/services/actions/ActionPayload'
import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer'

export class PayloadTransformer implements ValueTransformer {
  to (actionPayload: ActionPayload) {
    return JSON.stringify(actionPayload)
  }

  from (payloadString: string) {
    return JSON.parse(payloadString) as PayloadTransformer
  }
}

@Entity()
export default class Action extends BaseEntity implements SnakeSerializable {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ type: 'datetime' }) @Serializable @AsDate
  createdAt: Date

  @Column({ type: 'datetime' }) @Serializable @AsDate
  deletedAt: Date

  // @Column() @Serializable
  // surveyId: string
  @Column() @Serializable
  questionId: string

  @Column({ type: 'text', transformer: new PayloadTransformer() }) @Serializable
  payload: ActionPayload

  @Column('text') @Serializable
  actionType: string

  @Column() @Serializable
  interviewId: string

  @Column({ type: 'integer' }) @Serializable
  sectionFollowUpRepetition: number

  @Column({ type: 'integer' }) @Serializable
  sectionRepetition: number

  @Column() @Serializable
  preloadActionId: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  followUpActionId: string

  @Column({ type: 'integer' }) @Serializable
  randomSortOrder: number

  @Column({ type: 'integer' }) @Serializable
  sortOrder: number

  toSnakeJSON () {
    const d = super.toSnakeJSON()
    if (typeof d.payload !== 'string') {
      d.payload = JSON.stringify(d.payload)
    }
    return d
  }

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    if (typeof this.payload === 'string') {
      this.payload = JSON.parse(this.payload)
    }
    return this
  }
}
