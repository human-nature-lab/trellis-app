import { PrimaryColumn, Entity, Column } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity('config')
export default class Config {
  @PrimaryColumn({ name: 'name' }) @Serializable
  name: string

  @Column({ name: 'val' }) @Serializable
  val: string
}
