import {Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import ConditionTag from "./ConditionTag";
import {now} from '../../services/DateService'

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

  fromRecycler (id, respondentId, conditionTagId) {
    this.id = id
    this.respondentId = respondentId
    this.conditionTagId = conditionTagId
    this.updatedAt = now()
    this.createdAt = now()
    return this
  }

  fromSnakeJSON(json: object) {
    debugger
    mapFromSnakeJSON(this, json, {
      conditionTag: {
        constructor: ConditionTag,
        jsonKey: 'condition'
      }
    })
    return super.fromSnakeJSON(json)
  }

}
