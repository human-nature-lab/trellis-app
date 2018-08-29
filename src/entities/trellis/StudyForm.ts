import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
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
  @OneToOne(type => Form, { eager: true })
  @JoinColumn({ name : 'form_master_id' })
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
