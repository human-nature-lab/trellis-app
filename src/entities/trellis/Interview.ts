import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn} from 'typeorm'
import {AsDate, Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Survey from './Survey'
import User from './User'
import MomentTransformer from '../base/MomentTransformer'

@Entity()
export class Interview extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  surveyId: string
  @Column({ nullable: true }) @Serializable
  userId: string
  @Column({ type: 'datetime', transformer: MomentTransformer }) @Serializable @AsDate
  startTime: Date
  @Column({ type: 'datetime', nullable: true, transformer: MomentTransformer }) @Serializable @AsDate
  endTime: Date
  @Column({ nullable: true }) @Serializable
  latitude: string
  @Column({ nullable: true }) @Serializable
  longitude: string
  @Column({ nullable: true }) @Serializable
  altitude: string
  // @Column({ nullable: true }) @Serializable
  // previousInterviewId: string
  // @Column({ type: 'datetime', nullable: true }) @Serializable @AsDate
  // completedAt: Date

  @Relationship(type => Survey)
  @ManyToOne(type => Survey)
  survey: Survey

  @Relationship(type => User)
  @OneToOne(type => User)
  @JoinColumn()
  user: User

}

export default Interview
