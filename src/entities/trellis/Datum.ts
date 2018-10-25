import uuidv4 from 'uuid/v4'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {Serializable} from '../decorators/WebOrmDecorators'
import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {now} from '../../services/DateService'
import QuestionDatum from "./QuestionDatum";

export interface DatumRecyclerData {
  surveyId: string
  questionDatumId: string
  eventOrder: number
  val: string
  sortOrder: number
  name: string
  edgeId: string
  geoId: string
  photoId: string
  rosterId: string
  choiceId: string
}

@Entity()
export default class Datum extends TimestampedSoftDelete implements SnakeSerializable {
  @Column() @Serializable
  public choiceId: string;
  @Column() @Serializable
  public datumTypeId: string = '0';
  @Column() @Serializable
  public edgeId: string;
  @Column({type: 'integer'}) @Serializable
  public eventOrder: number;
  @Column() @Serializable
  public geoId: string;
  @PrimaryColumn() @Serializable
  public id: string;
  @Column() @Serializable
  public name: string;
  @Column() @Serializable
  public photoId: string;
  @Column() @Serializable
  public questionDatumId: string;
  @Column() @Serializable
  public rosterId: string;
  @Column({type: 'integer'}) @Serializable
  public sortOrder: number;
  @Column() @Serializable
  public surveyId: string;
  @Column() @Serializable
  public val: string;

  @ManyToOne(type => QuestionDatum, questionDatum => questionDatum.data)
  questionDatum: QuestionDatum

  /**
   * Called from the recycler when making a new instance of this
   * @param {DatumRecyclerData} data
   * @returns {this}
   */
  fromRecycler (data: DatumRecyclerData){
    this.id = uuidv4()
    this.updatedAt = now()
    this.createdAt = now()
    for (let key in data) {
      if (data[key] !== undefined) {
        this[key] = data[key]
      }
    }
    return this
  }

  copy () {
    let d = new Datum()
    d.choiceId = this.choiceId
    d.datumTypeId = this.datumTypeId
    d.edgeId = this.edgeId
    d.eventOrder = this.eventOrder
    d.geoId = this.geoId
    d.id = this.id
    d.name = this.name
    d.photoId = this.photoId
    d.questionDatumId = this.questionDatumId
    d.rosterId = this.rosterId
    d.sortOrder = this.sortOrder
    d.surveyId = this.surveyId
    d.val = this.val
    d.createdAt = this.createdAt
    d.updatedAt = this.updatedAt
    d.deletedAt = this.deletedAt
    return d
  }
}
