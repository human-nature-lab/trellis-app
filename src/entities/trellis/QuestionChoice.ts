import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Choice from "./Choice";
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Question from "./Question";

@Entity()
export default class QuestionChoice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionId: string
  @Column() @Serializable
  choiceId: string
  @Column({ type: 'integer' }) @Serializable
  sortOrder: number

  @Relationship(Choice)
  @OneToOne(type => Choice)
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
        choice: Choice
      })
    }
    return this
  }
}
