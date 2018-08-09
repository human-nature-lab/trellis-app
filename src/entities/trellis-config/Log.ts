import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("log")
export default class Log {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({ name: "message" })
  message: string;

  @Column({ name: "full_message" })
  fullMessage: string;

  @Column({ name: "severity", comment: "error, warn, info, verbose, debug, trace" })
  severity: string;

  @Column({ name: "component", nullable: true })
  component: string;

  @Column({ name: "sync_id", nullable: true })
  syncId: string;

  @Column({ name: "interview_id", nullable: true })
  interviewId: string;

  @Column({ name: "device_id", nullable: true })
  deviceId: string;

  @Column({ name: "user_id", nullable: true })
  userId: string;

  @Column({ name: "created_at" })
  createdAt: Date;
}
