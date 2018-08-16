import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {AsDate, Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Survey from "./Survey";

@Entity()
export default class Interview extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
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
  @Column({ nullable: true }) @Serializable
  previousInterviewId: string
  @Column({ type: 'datetime', nullable: true }) @Serializable @AsDate
  completedAt: Date

  survey: Survey

  fromSnakeJSON(json: any) {
    mapFromSnakeJSON(this, json, {
      survey: Survey
    })
    super.fromSnakeJSON(json)
    return this
 }
}
