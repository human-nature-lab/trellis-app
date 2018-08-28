import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain} from '../../services/JSONUtil'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {Serializable} from '../WebOrmDecorators'

@Entity()
export default class Action extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  surveyId: string
  @Column() @Serializable
  questionId: string
  @Column({ type: 'text' }) @Serializable
  payload: string
  @Column() @Serializable
  actionType: string
  @Column() @Serializable
  interviewId: string
  @Column({ type: 'integer' }) @Serializable
  sectionFollowUpRepetition: number
  @Column({ type: 'integer' }) @Serializable
  sectionRepetition: number

  toSnakeJSON () {
    let d = super.toSnakeJSON()
    if (typeof d['payload'] !== 'string') {
      d['payload'] = JSON.stringify(d['payload'])
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
