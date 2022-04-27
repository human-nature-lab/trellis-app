import { PrimaryColumn, Entity, Column } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity('sync')
export default class Sync {
  @PrimaryColumn({ name: 'id', type: 'text' }) @Serializable
  id: string

  @Column({ name: 'type', type: 'text' }) @Serializable
  type: string

  @Column({ name: 'status', type: 'text' }) @Serializable
  status: string

  @Column({ name: 'device_id', type: 'text' }) @Serializable
  deviceId: string

  @Column({ name: 'snapshot_id', nullable: true, type: 'text' }) @Serializable
  snapshotId: string

  @Column({ name: 'snapshot_created_at', type: 'datetime', nullable: true }) @Serializable
  snapshotCreatedAt: Date

  @Column({ name: 'file_name', type: 'text' }) @Serializable
  fileName: string

  @Column({ name: 'created_at', type: 'datetime' }) @Serializable
  createdAt: Date

  @Column({ name: 'completed_at', type: 'datetime', nullable: true }) @Serializable
  completedAt: Date
}
