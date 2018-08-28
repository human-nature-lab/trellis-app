import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {getColumnMeta, Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Form from "./Form";

@Entity()
export default class StudyForm extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  studyId: string
  @Column() @Serializable
  formMasterId: string
  @Column() @Serializable
  sortOrder: number
  @Column() @Serializable
  formTypeId: string
  @Column({ nullable: true }) @Serializable
  censusTypeId: string

  @Relationship(Form)
  form: Form

  fromSnakeJSON(json: any) {
    if (json.study_form && json.study_form.length) {
      super.fromSnakeJSON(json.study_form[0])
      this.form = new Form().fromSnakeJSON(json)
    } else {
      super.fromSnakeJSON(json)
    }
    this.sortOrder = +this.sortOrder // Convert to a number
    return this
 }
}
