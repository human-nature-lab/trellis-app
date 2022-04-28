import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Question from './Question'

@Entity()
export default class QuestionType extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  name: string

  @OneToMany(type => Question, q => q.questionType)
  questions: Question[]
}
