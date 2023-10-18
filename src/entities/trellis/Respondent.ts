import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import RespondentName from './RespondentName'
import RespondentGeo from './RespondentGeo'
import RespondentConditionTag from './RespondentConditionTag'
import Geo from './Geo'
import ConditionTag from './ConditionTag'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import Photo from './Photo'
import { LazyQuery } from '../decorators/QueryDecorator'
import Survey from './Survey'
import Edge from './Edge'

@Entity()
export default class Respondent extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  assignedId: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  geoId: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  notes: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  geoNotes: string

  @Column('text') @Serializable
  name: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  associatedRespondentId: string

  @Relationship(type => RespondentGeo)
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
  @LazyQuery(type => RespondentConditionTag, (repo, respondent) => {
    return repo.find({
      respondentId: respondent.id,
      deletedAt: null,
    })
  }, { cached: false })
  respondentConditionTags: Promise<RespondentConditionTag[]>

  // Inverse relationships
  @OneToMany(type => Survey, survey => survey.respondent)
  surveys: Survey[]

  @OneToMany(type => Edge, edge => edge.sourceRespondent)
  sourceEdges: Edge[]

  @OneToMany(type => Edge, edge => edge.targetRespondent)
  targetEdges: Edge[]

  getName () {
    const displayName = this.names.find(name => name.isDisplayName)
    return displayName ? displayName.name : this.name
  }
}

function geoGenerator (geo) {
  const g = new RespondentGeo().fromSnakeJSON(geo.pivot)
  g.geo = new Geo().fromSnakeJSON(geo)
  return g
}

function rctGenerator (tag) {
  const rc = new RespondentConditionTag().fromSnakeJSON(tag.pivot)
  rc.conditionTag = new ConditionTag().fromSnakeJSON(tag)
  return rc
}
