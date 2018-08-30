import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Question from "./Question";

@Entity()
export default class QuestionType extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string

  @OneToMany(type => Question, q => q.questionType)
  questions: Question
}
