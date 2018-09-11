import {Serializable} from '../decorators/WebOrmDecorators'
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, AfterLoad} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ type: Boolean }) @Serializable
  isDisplayName: boolean
  @Column() @Serializable
  name: string
  @Column() @Serializable
  respondentId: string
  @Column({ nullable: true }) @Serializable
  localeId: string
  @Column({ nullable: true }) @Serializable
  previousRespondentNameId: string

  @ManyToOne(type => Respondent, respondent => respondent.names)
  respondent: Respondent

  fromSnakeJSON (json) {
    super.fromSnakeJSON(json)
    this.isDisplayName = !!this.isDisplayName
    return this
  }
}
