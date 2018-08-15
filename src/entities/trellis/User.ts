import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class User extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string
  @Column()
  username: string
  @Column()
  password: string
  @Column({ nullable: true })
  role: string
  @Column({ nullable: true })
  selectedStudyId: string
}
