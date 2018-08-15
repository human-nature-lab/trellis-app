import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

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
}
