import { PrimaryColumn, Entity, Column } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import MomentTransformer from '../base/MomentTransformer'
import BaseEntity from '../base/BaseEntity'
import { Moment } from 'moment'

@Entity('log')
export default class Log extends BaseEntity {
  @PrimaryColumn({ name: 'id', type: 'text' }) @Serializable
  id: string

  @Column({ name: 'message', type: 'text' }) @Serializable
  message: string

  @Column({ name: 'full_message', type: 'text' }) @Serializable
  fullMessage: string

  @Column({ name: 'severity', comment: 'error, warn, info, verbose, debug, trace', type: 'text' }) @Serializable
  severity: string

  @Column({ name: 'component', nullable: true, type: 'text' }) @Serializable
  component: string

  @Column({ name: 'sync_id', nullable: true, type: 'text' }) @Serializable
  syncId: string

  @Column({ name: 'interview_id', nullable: true, type: 'text' }) @Serializable
  interviewId: string

  @Column({ name: 'device_id', nullable: true, type: 'text' }) @Serializable
  deviceId: string

  @Column({ name: 'user_id', nullable: true, type: 'text' }) @Serializable
  userId: string

  @Column({ name: 'created_at', type: 'datetime', transformer: MomentTransformer }) @Serializable
  createdAt: Moment

  @Column({ name: 'version', nullable: true, type: 'text' }) @Serializable
  version: string

  @Column({ name: 'offline', default: true, nullable: true, type: 'boolean' }) @Serializable
  offline: boolean

  @Column({ name: 'user_agent', nullable: true, type: 'text' }) @Serializable
  userAgent: string

  @Column({ name: 'uploaded_at', nullable: true, type: 'datetime', transformer: MomentTransformer })
  uploadedAt: Moment

  toSnakeJSON () {
    const d = super.toSnakeJSON() as Record<string, any>
    d.full_message = JSON.stringify(d.full_message)
    return d
  }
}
