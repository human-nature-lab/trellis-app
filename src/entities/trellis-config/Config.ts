import { PrimaryColumn, Entity, Column } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity('config')
export default class Config {
  @PrimaryColumn({ name: 'name', type: 'text' }) @Serializable
  name: string

  @Column({ name: 'val', type: 'text' }) @Serializable
  val: string
}
