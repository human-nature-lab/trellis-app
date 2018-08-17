import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Parameter from "./Parameter";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionParameter extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionId: string
  @Column() @Serializable
  parameterId: string
  @Column() @Serializable
  val: string

  parameter: Parameter

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      parameter: Parameter
    })
    return super.fromSnakeJSON(json)
  }
}
