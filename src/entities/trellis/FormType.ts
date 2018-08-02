import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class FormType {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
