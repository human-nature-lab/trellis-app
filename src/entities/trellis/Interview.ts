import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn} from 'typeorm'
import {AsDate, Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Survey from "./Survey";
import User from "./User";

@Entity()
export class Interview extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  surveyId: string
  @Column({ nullable: true }) @Serializable
  userId: string
  @Column({ type: 'datetime' }) @Serializable @AsDate
  startTime: Date
  @Column({ type: 'datetime', nullable: true }) @Serializable @AsDate
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

  @Relationship(Survey)
  @ManyToOne(type => Survey)
  survey: Survey

  @Relationship(User)
  @OneToOne(type => User)
  @JoinColumn()
  user: User

}

export default Interview
