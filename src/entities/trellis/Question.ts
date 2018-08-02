import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Question extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionTypeId: string
  @Column()
  questionTranslationId: string
  @Column()
  questionGroupId: string
  @Column({ type: 'tinyint' })
  sortOrder: number
  @Column()
  varName: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
