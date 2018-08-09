import uuidv4 from 'uuid/v4'
import FromJSON from "../interfaces/FromJSON";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {Column, Entity} from "typeorm";
import {mapCamelToPlain, mapPropsFromJSON} from "../../services/JSONUtil";
import ToSnakeJSON from "../interfaces/ToSnakeJSON";

@Entity()
export default class Datum extends TimestampedSoftDelete implements FromJSON, ToSnakeJSON {
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

  fromJSON (json) {
    mapPropsFromJSON(this, json)
    return this
  }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}
