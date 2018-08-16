import uuidv4 from 'uuid/v4'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {Column, Entity} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import SnakeSerializable from "../interfaces/SnakeSerializable";

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
  @Column() @Serializable
  public id: string = uuidv4();
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
}
