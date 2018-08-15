import {Entity} from '../TypeOrmDecorators'
import {Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class AssignConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  conditionTagId: string
  @Column({ type: 'text' })
  logic: string
  @Column({nullable: true})
  scope: string
}
