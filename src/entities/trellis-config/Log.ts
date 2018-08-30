import {PrimaryColumn, Entity, Column} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'

@Entity("log")
export default class Log {
  @PrimaryColumn({ name: "id" }) @Serializable
  id: string;

  @Column({ name: "message" }) @Serializable
  message: string;

  @Column({ name: "full_message" }) @Serializable
  fullMessage: string;

  @Column({ name: "severity", comment: "error, warn, info, verbose, debug, trace" }) @Serializable
  severity: string;

  @Column({ name: "component", nullable: true }) @Serializable
  component: string;

  @Column({ name: "sync_id", nullable: true }) @Serializable
  syncId: string;

  @Column({ name: "interview_id", nullable: true }) @Serializable
  interviewId: string;

  @Column({ name: "device_id", nullable: true }) @Serializable
  deviceId: string;

  @Column({ name: "user_id", nullable: true }) @Serializable
  userId: string;

  @Column({ name: "created_at" }) @Serializable
  createdAt: Date;
}
