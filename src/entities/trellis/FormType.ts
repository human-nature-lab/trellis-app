import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class FormType {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
