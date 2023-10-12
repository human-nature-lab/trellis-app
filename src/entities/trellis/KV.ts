import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class KV extends TimestampedSoftDelete {
  @PrimaryColumn()
  id: number

  @Column({ type: 'varchar', default: 'default' })
  namespace: string

  @Column({ type: 'varchar', nullable: false })
  key: string

  @Column({ type: 'text', nullable: true })
  value: string
}
