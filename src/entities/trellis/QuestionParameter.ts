import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Parameter from './Parameter'
import Question from './Question'

@Entity()
export default class QuestionParameter extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  questionId: string

  @Column('uuid') @Serializable
  parameterId: string

  @Column('text') @Serializable
  val: string

  @Relationship(type => Parameter)
  @OneToOne(type => Parameter, { eager: true })
  @JoinColumn()
  parameter: Parameter

  @ManyToOne(type => Question, question => question.questionParameters)
  question: Question
}
