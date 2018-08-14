import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain, mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
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
  @PrimaryGeneratedColumn()
  id: string
  @Column({ nullable: true })
  assignedId: string
  @Column({ nullable: true })
  geoId: string
  @Column({ nullable: true })
  notes: string
  @Column({ nullable: true })
  geoNotes: string
  @Column()
  name: string
  @Column({ nullable: true })
  associatedRespondentId: string

  names: RespondentName[]
  geos: RespondentGeo[]
  respondentConditionTags: RespondentConditionTag[]
  photos: Photo[]

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
      respondent_condition_tags: {
        generator: tag => {
          let rc = new RespondentConditionTag().fromSnakeJSON(tag.pivot)
          rc.conditionTag = new ConditionTag().fromSnakeJSON(tag)
          return rc
        }
      }
    })
    return this
  }

  toSnakeJSON() {
    let d = mapCamelToPlain(this)
    for (let key of ['names', 'geos', 'respondent_condition_tags', 'photos']){
      delete d[key]
    }
    return d
  }
}
