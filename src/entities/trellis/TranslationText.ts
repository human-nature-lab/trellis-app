import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class TranslationText extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  translationId: string
  @Column({ nullable: true })
  localeId: string
  @Column('text')
  translatedText: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
  }
}
