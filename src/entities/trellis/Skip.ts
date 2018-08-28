import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ConditionTag from "./ConditionTag";
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import QuestionGroupSkip from "./QuestionGroupSkip";

@Entity()
export default class Skip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  showHide: boolean
  @Column() @Serializable
  anyAll: boolean
  @Column({ type: 'tinyint' }) @Serializable
  precedence: number

  @Relationship({
    constructor: ConditionTag,
    jsonKey: 'conditions'
  })
  conditionTags: ConditionTag[]

}
