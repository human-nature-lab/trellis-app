import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class StudyRespondent extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  studyId: string
  @Column()
  respondentId: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
 }
}
