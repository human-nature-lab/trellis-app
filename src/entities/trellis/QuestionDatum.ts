import FromJSON from "../interfaces/FromJSON";
import uuid from 'uuid/v4'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import Datum from "./Datum";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {mapPropsFromJSON, mapFromJSON, mapCamelToPlain} from "../../services/JSONUtil";
import ToSnakeJSON from "../interfaces/ToSnakeJSON";

@Entity()
export default class QuestionDatum extends TimestampedSoftDelete implements FromJSON, ToSnakeJSON {
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

  fromJSON (json) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      data: {
        constructor: Datum,
        jsonKey: 'datum'
      }
    })
    return this
  }

  toSnakeJSON () {
    let d = mapCamelToPlain(this, true)
    delete d['data']
    return d
  }

  copy () {
    let c = new QuestionDatum()
    const columns = ['id', 'questionId', 'surveyId', 'followUpDatumId', 'sectionRepetition', 'answeredAt', 'skippedAt', 'dkRf', 'dkRfVal', 'interviewId']
    for (let key in columns) {
      c[key] = this[key]
    }
    return c
  }

}
