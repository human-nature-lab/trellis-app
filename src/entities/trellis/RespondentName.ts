import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
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
}
