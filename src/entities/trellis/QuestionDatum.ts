import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Datum from './Datum'
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {AsDate, Relationship, Serializable} from '../decorators/WebOrmDecorators'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {now} from '../../services/DateService'
import {PrimaryColumn} from "typeorm/browser";
import MomentTransformer from '../base/MomentTransformer'
import {Moment} from 'moment'

export interface QuestionDatumRecyclerData {
  id: string
  questionId: string
  surveyId: string
  followUpDatumId: string
  sectionRepetition: number
  answeredAt: Date
  skippedAt: Date
  interviewId: string
  dkRf: boolean
  dkRfVal: string
}

@Entity()
export default class QuestionDatum extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryColumn() @Serializable
  public id: string
  @Column() @Serializable
  public questionId: string
  @Column() @Serializable
  public surveyId: string
  @Column() @Serializable
  public followUpDatumId: string
  @Column() @Serializable
  public sectionRepetition: number
  @Column({name: 'answered_at', type: 'datetime', nullable: true, transformer: MomentTransformer}) @Serializable @AsDate
  public answeredAt: Moment
  @Column({name: 'skipped_at', type: 'datetime', nullable: true, transformer: MomentTransformer}) @Serializable @AsDate
  public skippedAt: Moment
  @Column() @Serializable
  public dkRf: boolean
  @Column() @Serializable
  public dkRfVal: string
  // @Column() @Serializable
  // public interviewId: string

  @Relationship(type => Datum)
  @OneToMany(type => Datum, datum => datum.questionDatum)
  data: Datum[]

  /**
   * Called from the recycler
   * @param {QuestionDatumRecyclerData} data
   * @returns {this}
   */
  fromRecycler (data: QuestionDatumRecyclerData) {
    for (let key in data) {
      this[key] = data[key]
    }
    if (this['interviewId']) {
      delete this['interviewId']
    }
    this.createdAt = now()
    this.updatedAt = now()
    this.data = []
    return this
  }

  copy () {
    const q = new QuestionDatum()
    q.id = this.id
    q.questionId = this.questionId
    q.surveyId = this.surveyId
    q.followUpDatumId = this.followUpDatumId
    q.sectionRepetition = this.sectionRepetition
    q.answeredAt = this.answeredAt
    q.skippedAt = this.skippedAt
    q.dkRf = this.dkRf
    q.dkRfVal = this.dkRfVal
    q.data = []
    q.createdAt = this.createdAt
    q.updatedAt = this.updatedAt
    q.deletedAt = this.deletedAt
    return q
  }

}
