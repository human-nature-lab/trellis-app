import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import RespondentName from "./RespondentName";
import RespondentGeo from "./RespondentGeo";
import RespondentConditionTag from "./RespondentConditionTag";
import RespondentPhoto from "./RespondentPhoto";
import Geo from "./Geo";
import ConditionTag from "./ConditionTag";
import SnakeSerializable from "../interfaces/SnakeSerializable";
import Photo from "./Photo";

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

  @Relationship(RespondentName)
  names: RespondentName[]

  @Relationship({
    generator: geo => {
      let g = new RespondentGeo().fromSnakeJSON(geo.pivot)
      g.geo = new Geo().fromSnakeJSON(geo)
      return g
    }
  })
  geos: RespondentGeo[]

  @Relationship({
    generator: tag => {
      let rc = new RespondentConditionTag().fromSnakeJSON(tag.pivot)
      rc.conditionTag = new ConditionTag().fromSnakeJSON(tag)
      return rc
    }
  })
  respondentConditionTags: RespondentConditionTag[]

  @Relationship({
    generator: p => {
      let rp = new RespondentPhoto().fromSnakeJSON(p.pivot)
      rp.photo = new Photo().fromSnakeJSON(p)
      return rp
    }
  })
  photos: RespondentPhoto[]
}
