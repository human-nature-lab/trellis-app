import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import {mapPropsFromJSON} from "../../services/JSONUtil";
import BaseEntity from "../base/BaseEntity";

@Entity()
export default class CensusType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
