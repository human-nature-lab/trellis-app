import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Interview extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  surveyId: string
  @Column({ nullable: true })
  userId: string
  @Column({ type: 'datetime' })
  startTime: Date
  @Column({ type: 'datetime', nullable: true })
  endTime: Date
  @Column({ nullable: true })
  latitude: string
  @Column({ nullable: true })
  longitude: string
  @Column({ nullable: true })
  altitude: string
  @Column({ nullable: true })
  previousInterviewId: string
  @Column({ type: 'datetime', nullable: true })
  completedAt: Date

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
