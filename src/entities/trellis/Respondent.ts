import {Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, JoinTable, ManyToMany} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
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
  @PrimaryGeneratedColumn('uuid') @Serializable
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

  @Relationship({ generator: geoGenerator })
  @OneToMany(type => RespondentGeo, respondentGeo => respondentGeo.respondent, { eager: true })
  geos: RespondentGeo[]

  @Relationship(RespondentName)
  @OneToMany(type => RespondentName, respondentName => respondentName.respondent, { eager: true })
  names: RespondentName[]

  @Relationship(Photo)
  @ManyToMany(type => Photo, photo => photo.respondents, { eager: true })
  @JoinTable({ name: 'respondent_photo' })
  photos: Photo[]

  @Relationship({ generator: rctGenerator })
  // @OneToMany(type => RespondentConditionTag, respondentConditionTag => respondentConditionTag.respondent, { eager: true })
  get respondentConditionTags (): Promise<RespondentConditionTag[]> {
    let _respondentConditionTags
    if (_respondentConditionTags !== undefined) {
      return new Promise(resolve => { resolve(_respondentConditionTags) })
    } else {
      const DatabaseService = require('../../services/database/DatabaseService').default
      return DatabaseService.getRepository(RespondentConditionTag).then((repository) => repository.find({
        respondentId: this.id,
        deletedAt: null
      }))
    }
  }


}

function geoGenerator (geo) {
  let g = new RespondentGeo().fromSnakeJSON(geo.pivot)
  g.geo = new Geo().fromSnakeJSON(geo)
  return g
}

function rctGenerator (tag) {
  let rc = new RespondentConditionTag().fromSnakeJSON(tag.pivot)
  rc.conditionTag = new ConditionTag().fromSnakeJSON(tag)
  return rc
}
