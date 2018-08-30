import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
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

  @Relationship(Respondent)
  targetRespondent: Respondent
  @Relationship(Respondent)
  sourceRespondent: Respondent

}
