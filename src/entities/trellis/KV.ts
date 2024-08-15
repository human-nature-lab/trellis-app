import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import uuid from 'uuid/v4'

@Entity()
export default class KV extends TimestampedSoftDelete {
  @PrimaryColumn({ type: 'uuid' })
  id: string

  @Column({ type: 'varchar', default: 'default' })
  namespace: string

  @Column({ type: 'varchar', nullable: false })
  key: string

  @Column({ type: 'text', nullable: true })
  value: string
}
