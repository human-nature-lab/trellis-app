import FromJSON from "../interfaces/FromJSON";
import uuid from 'uuid/v4'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import Datum from "./Datum";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {mapFromSnakeJSON, mapCamelToPlain} from "../../services/JSONUtil";
import SnakeSerializable from "../interfaces/SnakeSerializable";

@Entity()
export default class QuestionDatum extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn()
  public id: string = uuid();
  @Column()
  public questionId: string;
  @Column()
  public surveyId: string;
  @Column()
  public followUpDatumId: string
  @Column()
  public sectionRepetition: number
  @Column({type: 'datetime'})
  public answeredAt: Date
  @Column({type: 'datetime'})
  public skippedAt: Date
  @Column()
  public dkRf: boolean;
  @Column()
  public dkRfVal: string;
  @Column()
  public interviewId: string;

  data: Datum[] = []

  fromSnakeJSON (json) {
    mapFromSnakeJSON(this, json, {
      data: {
        constructor: Datum,
        jsonKey: 'datum'
      }
    })
    super.fromSnakeJSON(json)
    return this
  }

  toSnakeJSON () {
    let d = mapCamelToPlain(this, true)
    delete d['data']
    return d
  }
}
