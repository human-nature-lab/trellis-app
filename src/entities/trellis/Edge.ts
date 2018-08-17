import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from "./Respondent";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class Edge extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  sourceRespondentId: string
  @Column() @Serializable
  targetRespondentId: string

  targetRespondent: Respondent
  sourceRespondent: Respondent

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      sourceRespondent: Respondent,
      targetRespondent: Respondent
    })
    return super.fromSnakeJSON(json)
  }
}
