import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Skip from "./Skip";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionGroupSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionGroupId: string
  @Column() @Serializable
  skipId: string

  @Relationship(Skip)
  skip: Skip

}
