import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class QuestionGroupSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionGroupId: string
  @Column()
  skipid: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
