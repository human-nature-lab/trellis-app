import { PrimaryColumn, Entity, Column } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity('sync')
export default class Sync {
  @PrimaryColumn({ name: 'id' }) @Serializable
  id: string

  @Column({ name: 'type' }) @Serializable
  type: string

  @Column({ name: 'status' }) @Serializable
  status: string

  @Column({ name: 'device_id' }) @Serializable
  deviceId: string

  @Column({ name: 'snapshot_id', nullable: true }) @Serializable
  snapshotId: string

  @Column({ name: 'snapshot_created_at', type: 'datetime', nullable: true }) @Serializable
  snapshotCreatedAt: Date

  @Column({ name: 'file_name' }) @Serializable
  fileName: string

  @Column({ name: 'created_at', type: 'datetime' }) @Serializable
  createdAt: Date

  @Column({ name: 'completed_at', type: 'datetime', nullable: true }) @Serializable
  completedAt: Date
}

/* TODO:
relations: {
  messages: {
    target: 'Message',
      type: 'many-to-many',
      joinTable: true,
      cascade: true
  }
}
*/
