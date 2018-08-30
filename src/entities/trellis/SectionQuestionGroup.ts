import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from 'typeorm'
import {Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import QuestionGroup from "./QuestionGroup";

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

  @OneToOne(type => QuestionGroup, qg => qg.sectionQuestionGroup)
  @JoinColumn()
  questionGroup: QuestionGroup

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    this.questionGroupOrder = +this.questionGroupOrder
    return this
  }
}
