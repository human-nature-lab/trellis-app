import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class FormSection extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  formId: string
  @Column()
  sectionId: string
  @Column({type: 'integer'})
  sortOrder: number
  @Column()
  isRepeatable: boolean
  @Column()
  maxRepetitions: number
  @Column({ nullable: true })
  repeatPromptTranslationid: string
  @Column({ nullable: true })
  followUpQuestionid: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
