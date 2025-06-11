import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('config')
export class Config {
  @PrimaryColumn({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'val', type: 'text' })
  val: string
}
