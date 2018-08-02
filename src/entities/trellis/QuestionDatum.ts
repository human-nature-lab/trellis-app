import FromJSON from "../interfaces/FromJSON";
import uuid from 'uuid/v4'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import Datum from "./Datum";
import {Column, PrimaryGeneratedColumn} from "typeorm";
import {assignJSONProps} from "../../services/JSONUtil";

export default class QuestionDatum extends TimestampedSoftDelete implements FromJSON {
  @PrimaryGeneratedColumn()
  public id: string = uuid();
  @Column()
  public questionId: string;
  @Column()
  public followUpDatumId: string;
  @Column()
  public sectionRepetition: number;
  @Column({type: 'datetime'})
  public answeredAt: Date;
  @Column({type: 'datetime'})
  public skippedAt: Date;
  @Column()
  public dkRf: boolean;
  @Column()
  public dkRfVal: string;
  @Column()
  public interviewId: string;

  fromJSON (json) {
    assignJSONProps(this, json)
    for (let d of json.data) {
      let datum = new Datum()
      datum.fromJSON(d)
    }
    return this
  }

}
