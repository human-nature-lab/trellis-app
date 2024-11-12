import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'

@Entity()
export default class Edge extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  sourceRespondentId: string

  @Column() @Serializable
  targetRespondentId: string

  @Relationship(type => Respondent)
  @ManyToOne(type => Respondent, respondent => respondent.targetEdges)
  @JoinColumn()
  targetRespondent: Respondent

  @Relationship(type => Respondent)
  @ManyToOne(type => Respondent, respondent => respondent.sourceEdges)
  @JoinColumn()
  sourceRespondent: Respondent

  @Column() @Serializable
  note?: string
}
