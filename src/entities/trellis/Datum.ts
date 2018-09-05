import uuidv4 from 'uuid/v4'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {Serializable} from '../decorators/WebOrmDecorators'
import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {now} from '../../services/DateService'
import QuestionDatum from "./QuestionDatum";

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

  fromRecycler (
    surveyId: string,
    questionDatumId: string,
    eventOrder: number,
    val: string,
    sortOrder: number,
    name: string,
    edgeId: string,
    geoId: string,
    photoId: string,
    rosterId: string,
    choiceId: string
  ){
    this.id = uuidv4()
    this.updatedAt = now()
    this.createdAt = now()
    this.surveyId = surveyId
    this.questionDatumId = questionDatumId
    this.eventOrder = eventOrder
    this.val = val
    this.sortOrder = sortOrder
    this.name = name
    this.edgeId = edgeId
    this.geoId = geoId
    this.photoId = photoId
    this.rosterId = rosterId
    this.choiceId = choiceId
    return this
  }
}
