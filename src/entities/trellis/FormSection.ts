import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

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

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
 }
}
