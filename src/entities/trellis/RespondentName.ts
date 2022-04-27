import { Serializable } from '../decorators/WebOrmDecorators'
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ type: Boolean }) @Serializable
  isDisplayName: boolean

  @Column('text') @Serializable
  name: string

  @Column('text') @Serializable
  respondentId: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  localeId: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  previousRespondentNameId: string

  @ManyToOne(type => Respondent, respondent => respondent.names)
  respondent: Respondent

  fromSnakeJSON (json) {
    super.fromSnakeJSON(json)
    this.isDisplayName = !!this.isDisplayName
    return this
  }
}
