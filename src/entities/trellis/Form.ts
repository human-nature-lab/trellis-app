import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  formMasterId: string
  @Column()
  nameTranslationId: string
  @Column({type: 'integer'})
  version: number
  @Column()
  isPublished: boolean

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
