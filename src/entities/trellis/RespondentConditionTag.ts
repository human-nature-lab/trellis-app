import {Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import ConditionTag from "./ConditionTag";

export default class RespondentConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  conditionTagId: string

  conditionTag: ConditionTag

  // Handle naming inconsistencies with Section and Survey condition tags
  get conditionId () {
    return this.conditionTagId
  }
  set conditionId (id) {
    this.conditionTagId = id
  }

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      condition_tag: ConditionTag
    })
    super.fromSnakeJSON(json)
    return this
  }

}
