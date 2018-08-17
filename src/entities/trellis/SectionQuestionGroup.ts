import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class SectionQuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  sectionId: string
  @Column() @Serializable
  questionGroupId: string
  @Column({ type: 'integer' }) @Serializable
  questionGroupOrder: number

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    this.questionGroupOrder = +this.questionGroupOrder
    return this
  }
}
