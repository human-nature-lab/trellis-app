import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {getColumnMeta, Serializable} from '../TypeOrmDecorators'
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

  form: Form

  fromSnakeJSON(json: any) {
    let colMeta = getColumnMeta(this)
    if (json.study_form && json.study_form.length) {
      mapPropsFromJSON(this, json.study_form[0], colMeta.snake)
      this.form = new Form().fromSnakeJSON(json)
      this.parseDates()
    } else {
      mapFromSnakeJSON(this, json, {
        form: Form
      })
      super.fromSnakeJSON(json)
    }
    this.sortOrder = +this.sortOrder // Convert to a number
    return this
 }
}
