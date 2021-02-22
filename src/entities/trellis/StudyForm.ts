import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Form from './Form'

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
  formTypeId: number
  @Column({ nullable: true }) @Serializable
  censusTypeId: string
  @Column({ nullable: true }) @Serializable
  geoTypeId: string

  @Relationship(type => Form)
  @OneToOne(type => Form, { eager: true })
  @JoinColumn({ name : 'form_master_id' })
  form: Form

  fromSnakeJSON (json: any) {
    if (json.study_form && json.study_form.length) {
      super.fromSnakeJSON(json.study_form[0])
      this.form = new Form().fromSnakeJSON(json)
    } else if (json.pivot) {
      super.fromSnakeJSON(json.pivot)
      this.form = new Form().fromSnakeJSON(json)
    } else {
      super.fromSnakeJSON(json)
      this.formTypeId = +this.formTypeId
    }
    this.sortOrder = +this.sortOrder // Convert to a number
    return this
 }
}
