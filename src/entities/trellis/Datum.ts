import uuidv4 from 'uuid/v4'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {Column, Entity, PrimaryColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {now} from '../../services/DateService'

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
    rosterId: string
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
    return this
  }
}
