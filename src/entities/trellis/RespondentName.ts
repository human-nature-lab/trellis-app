import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  isDisplayName: boolean
  @Column()
  name: string
  @Column()
  respondentId: string
  @Column({ nullable: true })
  localeId: string
  @Column({ nullable: true })
  previousRespondentNameId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
