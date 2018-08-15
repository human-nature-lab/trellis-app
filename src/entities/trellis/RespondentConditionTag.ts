import {Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
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

  fromJSON (json: RespondentConditionTag) {
    this.id = json.id
    this.respondentId = json.respondentId
    this.conditionTagId = json.conditionTagId
    this.conditionTag = json.conditionTag
    for (let key of ['id', 'respondentId', 'conditionTagId', 'conditionTag']) {
      this[key] = json[key]
    }
    return this
  }

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'respondent_id', 'condition_tag_id', 'created_at', 'updated_at', 'deleted_at'])
    mapFromSnakeJSON(this, json, {
      condition_tag: ConditionTag
    })
    super.fromSnakeJSON(json)
    return this
  }

  copy () {
    return new RespondentConditionTag().fromJSON(this)
  }
}
