import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class SectionQuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  sectionId: string
  @Column()
  questionGroupId: string
  @Column({ type: 'integer' })
  questionGroupOrder: number

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
