import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  isDisplayName: boolean
  @Column()
  name: string
  @Column()
  respondentId: string
  @Column({ nullable: true })
  localeId: string
  @Column({ nullable: true })
  previousRespondentNameId: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
 }
}
