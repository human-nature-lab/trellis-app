import {Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {camelToSnake, mapCamelToPlain, mapPropsFromJSON} from '../../services/JSONUtil'
import SnakeSerializable from '../interfaces/SnakeSerializable'

export default class Action extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  surveyId: string
  @Column()
  questionId: string
  @Column({ type: 'text' })
  payload: string
  @Column()
  actionType: string
  @Column()
  interviewId: string
  @Column({ type: 'integer' })
  sectionFollowUpRepetition: number
  @Column({ type: 'integer' })
  sectionRepetition: number

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, this.__colNames__.map(camelToSnake))
    return this
  }

  toSnakeJSON () {
    let json = mapCamelToPlain(this, true)
    json['payload'] = this.payload // We don't do any case transformation for the payload
    super.fromSnakeJSON(json)
    return json
  }

}
