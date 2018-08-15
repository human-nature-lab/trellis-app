import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Form from "./Form";

@Entity()
export default class StudyForm extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  studyId: string
  @Column()
  formMasterId: string
  @Column()
  sortOrder: string
  @Column()
  formTypeId: string
  @Column({ nullable: true })
  censusTypeId: string

  form: Form

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      form: Form
    })
    super.fromSnakeJSON(json)
    return this
 }
}
