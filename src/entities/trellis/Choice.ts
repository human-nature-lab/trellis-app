import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'
import Translation from "./Translation";
import Question from "./Question";

@Entity()
export default class Choice extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  choiceTranslationId: string
  @Column() @Serializable
  val: string

  @Relationship(Translation)
  @OneToOne(type => Translation)
  @JoinColumn()
  choiceTranslation: Translation

  parameters?: object // Assigned and used by InterviewManager
}
