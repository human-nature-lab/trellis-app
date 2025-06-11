import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('sync')
export class Sync {
  @PrimaryColumn({ name: 'id', type: 'text' })
  id!: string

  @Column({ name: 'type', type: 'text' })
  type!: string

  @Column({ name: 'status', type: 'text' })
  status!: string

  @Column({ name: 'device_id', type: 'text' })
  deviceId!: string

  @Column({ name: 'snapshot_id', nullable: true, type: 'text' })
  snapshotId?: string

  @Column({ name: 'snapshot_created_at', type: 'datetime', nullable: true })
  snapshotCreatedAt?: Date

  @Column({ name: 'file_name', type: 'text' })
  fileName!: string

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt!: Date

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date
}
