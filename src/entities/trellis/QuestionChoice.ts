import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Choice from './Choice'
import { mapFromSnakeJSON } from '../../services/JSONUtil'
import Question from './Question'

@Entity()
export default class QuestionChoice extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ select: false, type: 'uuid' }) @Serializable
  questionId: string

  @Column({ select: false, type: 'uuid' }) @Serializable
  choiceId: string

  @Column({ type: 'integer' }) @Serializable
  sortOrder: number

  @Relationship(type => Choice)
  @OneToOne(type => Choice, { eager: true })
  @JoinColumn()
  choice: Choice

  @ManyToOne(type => Question, question => question.choices)
  question: Question

  fromSnakeJSON (json: any) {
    if (json.pivot) {
      super.fromSnakeJSON(json.pivot)
      this.choice = new Choice().fromSnakeJSON(json)
    } else {
      super.fromSnakeJSON(json)
      mapFromSnakeJSON(this, json, {
        choice: Choice,
      })
    }
    return this
  }
}
