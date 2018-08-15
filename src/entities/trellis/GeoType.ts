import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class GeoType extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ nullable: true })
  parentId: string
  @Column()
  studyId: string
  @Column()
  name: string
  @Column()
  canUserAdd: boolean
  @Column()
  canUserAddChild: boolean
  @Column()
  canContainRespondent: boolean
}
