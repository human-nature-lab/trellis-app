import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";
import Question from "./Question";

@Entity()
export default class Choice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  choiceTranslationId: string
  @Column() @Serializable
  val: string

  @Relationship(Translation)
  choiceTranslation: Translation

  parameters?: object // Assigned and used by InterviewManager
}
