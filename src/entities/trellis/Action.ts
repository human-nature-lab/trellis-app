import {Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain} from '../../services/JSONUtil'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {Serializable} from '../TypeOrmDecorators'

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
    let json = mapCamelToPlain(this, true)
    json['payload'] = this.payload // We don't do any case transformation for the payload
    super.fromSnakeJSON(json)
    return json
  }

}
