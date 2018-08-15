import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class FormType {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
