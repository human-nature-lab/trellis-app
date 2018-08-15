import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class Roster extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ type: 'text' })
  val: string
}
