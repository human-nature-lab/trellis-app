import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionGroupSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionGroupId: string
  @Column()
  skipid: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
