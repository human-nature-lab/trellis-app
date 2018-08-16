import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import RespondentName from "./RespondentName";
import RespondentGeo from "./RespondentGeo";
import RespondentConditionTag from "./RespondentConditionTag";
import Photo from "./Photo";
import RespondentPhoto from "./RespondentPhoto";
import Geo from "./Geo";
import ConditionTag from "./ConditionTag";
import SnakeSerializable from "../interfaces/SnakeSerializable";

@Entity()
export default class Respondent extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ nullable: true }) @Serializable
  assignedId: string
  @Column({ nullable: true }) @Serializable
  geoId: string
  @Column({ nullable: true }) @Serializable
  notes: string
  @Column({ nullable: true }) @Serializable
  geoNotes: string
  @Column() @Serializable
  name: string
  @Column({ nullable: true }) @Serializable
  associatedRespondentId: string

  names: RespondentName[]
  geos: RespondentGeo[]
  respondentConditionTags: RespondentConditionTag[]
  photos: RespondentPhoto[]

  fromSnakeJSON (json: any) {
    mapPropsFromJSON(this, json, ['id', 'assignedId', 'name', 'associatedRespondentId'])
    mapFromSnakeJSON(this, json, {
      names: RespondentName,
      photos: {
        generator: photo => {
          let p = new RespondentPhoto().fromSnakeJSON(photo.pivot)
          p.photo = new Photo().fromSnakeJSON(photo)
          return p
        }
      },
      geos: {
        generator: geo => {
          let g = new RespondentGeo().fromSnakeJSON(geo.pivot)
          g.geo = new Geo().fromSnakeJSON(geo)
          return g
        }
      },
      respondentConditionTags: {
        generator: tag => {
          let rc = new RespondentConditionTag().fromSnakeJSON(tag.pivot)
          rc.conditionTag = new ConditionTag().fromSnakeJSON(tag)
          return rc
        }
      }
    })
    super.fromSnakeJSON(json)
    return this
  }

}
