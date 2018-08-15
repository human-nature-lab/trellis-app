import uuidv4 from 'uuid/v4'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {Column, Entity} from "typeorm";
import SnakeSerializable from "../interfaces/SnakeSerializable";

@Entity()
export default class Datum extends TimestampedSoftDelete implements SnakeSerializable {
  @Column()
  public choiceId: string;
  @Column()
  public datumTypeId: string = '0';
  @Column()
  public edgeId: string;
  @Column({type: 'integer'})
  public eventOrder: number;
  @Column()
  public geoId: string;
  @Column()
  public id: string = uuidv4();
  @Column()
  public name: string;
  @Column()
  public photoId: string;
  @Column()
  public questionDatumId: string;
  @Column()
  public rosterId: string;
  @Column({type: 'integer'})
  public sortOrder: number;
  @Column()
  public surveyId: string;
  @Column()
  public val: string;
}
