import {Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import ConditionTag from "./ConditionTag";

export default class RespondentConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  respondentId: string
  @Column()
  conditionTagId: string

  conditionTag: ConditionTag

  // Handle naming inconsistencies with Section and Survey condition tags
  get conditionId () {
    return this.conditionTagId
  }
  set conditionId (id) {
    this.conditionTagId = id
  }

  fromJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'respondent_id', 'condition_tag_id', 'created_at', 'updated_at', 'deleted_at'])
    mapFromJSON(this, json, {
      condition_tag: ConditionTag
    })
    return this
  }
}
