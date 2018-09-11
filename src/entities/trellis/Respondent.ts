import {Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, JoinTable, ManyToMany} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import RespondentName from './RespondentName'
import RespondentGeo from './RespondentGeo'
import RespondentConditionTag from './RespondentConditionTag'
import Geo from './Geo'
import ConditionTag from './ConditionTag'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import Photo from './Photo'
import {LazyQuery} from '../decorators/QueryDecorator'
import Survey from "./Survey";
import Edge from "./Edge";


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

  @Relationship({ generator: geoGenerator })
  @OneToMany(type => RespondentGeo, respondentGeo => respondentGeo.respondent)
  geos: RespondentGeo[]

  @Relationship(type => RespondentName)
  @OneToMany(type => RespondentName, respondentName => respondentName.respondent)
  names: RespondentName[]

  @Relationship(type => Photo)
  @ManyToMany(type => Photo, photo => photo.respondents)
  @JoinTable({ name: 'respondent_photo' })
  photos: Photo[]

  @Relationship({ generator: rctGenerator, async: true })
  // @OneToMany(type => RespondentConditionTag, respondentConditionTag => respondentConditionTag.respondent, { eager: true })
  @LazyQuery(RespondentConditionTag, (repo, respondent) => {
    return repo.find({
      respondentId: respondent.id,
      deletedAt: null
    })
  }, { cached: false })
  respondentConditionTags: Promise<RespondentConditionTag[]>
  // get respondentConditionTags (): Promise<RespondentConditionTag[]> {
  //   let _respondentConditionTags
  //   if (_respondentConditionTags !== undefined) {
  //     return new Promise(resolve => { resolve(_respondentConditionTags) })
  //   } else {
  //     const DatabaseService = require('../../services/database/DatabaseService').default
  //     return DatabaseService.getRepository(RespondentConditionTag).then((repository) => repository.find({
  //       respondentId: this.id,
  //       deletedAt: null
  //     }))
  //   }
  // }

  // Inverse relationships
  @OneToMany(type => Survey, survey => survey.respondent)
  surveys: Survey[]

  @OneToMany(type => Edge, edge => edge.sourceRespondent)
  sourceEdges: Edge[]
  @OneToMany(type => Edge, edge => edge.targetRespondent)
  targetEdges: Edge[]


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
