import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Datum from './Datum'
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {AsDate, Relationship, Serializable} from '../decorators/WebOrmDecorators'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {now} from '../../services/DateService'
import {PrimaryColumn} from "typeorm/browser";

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
  @Column({type: 'datetime'}) @Serializable @AsDate
  public answeredAt: Date
  @Column({type: 'datetime'}) @Serializable @AsDate
  public skippedAt: Date
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

}
