import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";

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
