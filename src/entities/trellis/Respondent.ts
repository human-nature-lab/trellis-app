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

  fromJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'assignedId', 'name', 'associatedRespondentId'])
    // this.names =
    mapFromJSON(this, json, {
      names: RespondentName,
      geos: RespondentGeo,
      respondent_condition_tags: RespondentConditionTag,
      photos: RespondentPhoto
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
