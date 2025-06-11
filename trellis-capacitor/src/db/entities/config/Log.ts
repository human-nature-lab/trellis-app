import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('log')
export class Log {
  @PrimaryColumn({ name: 'id', type: 'text' })
  id!: string

  @Column({ name: 'message', type: 'text' })
  message!: string

  @Column({ name: 'full_message', type: 'text' })
  fullMessage!: string

  @Column({ name: 'severity', comment: 'error, warn, info, verbose, debug, trace', type: 'text' })
  severity!: string

  @Column({ name: 'component', nullable: true, type: 'text' })
  component?: string

  @Column({ name: 'sync_id', nullable: true, type: 'text' })
  syncId?: string

  @Column({ name: 'interview_id', nullable: true, type: 'text' })
  interviewId?: string

  @Column({ name: 'device_id', nullable: true, type: 'text' })
  deviceId?: string

  @Column({ name: 'user_id', nullable: true, type: 'text' })
  userId?: string

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt!: Date

  @Column({ name: 'version', nullable: true, type: 'text' })
  version?: string

  @Column({ name: 'offline', default: true, nullable: true, type: 'boolean' })
  offline?: boolean

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent?: string

  @Column({ name: 'uploaded_at', nullable: true, type: 'datetime' })
  uploadedAt?: Date
}
