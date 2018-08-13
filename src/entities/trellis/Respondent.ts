import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain, mapFromJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import RespondentName from "./RespondentName";
import RespondentGeo from "./RespondentGeo";
import RespondentConditionTag from "./RespondentConditionTag";
import Photo from "./Photo";
import RespondentPhoto from "./RespondentPhoto";
import FromJSON from "../interfaces/FromJSON";
import ToSnakeJSON from "../interfaces/ToSnakeJSON";
import Geo from "./Geo";
import ConditionTag from "./ConditionTag";

@Entity()
export default class Respondent extends TimestampedSoftDelete implements FromJSON, ToSnakeJSON {
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

  fromJSON (json: any) {
    mapPropsFromJSON(this, json, ['id', 'assignedId', 'name', 'associatedRespondentId'])
    mapFromJSON(this, json, {
      names: RespondentName,
      photos: {
        generator: photo => {
          let p = new RespondentPhoto().fromJSON(photo.pivot)
          p.photo = new Photo().fromJSON(photo)
          return p
        }
      },
      geos: {
        generator: geo => {
          let g = new RespondentGeo().fromJSON(geo.pivot)
          g.geo = new Geo().fromJSON(geo)
          return g
        }
      },
      respondent_condition_tags: {
        generator: tag => {
          let rc = new RespondentConditionTag().fromJSON(tag.pivot)
          rc.conditionTag = new ConditionTag().fromJSON(tag)
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
