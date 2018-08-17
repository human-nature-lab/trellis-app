import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
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

  conditionTags: ConditionTag[]

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      conditionTags: {
        constructor: ConditionTag,
        jsonKey: 'conditions'
      }
    })
    return super.fromSnakeJSON(json)
  }
}
