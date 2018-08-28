import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Section from "./Section";
import Skip from "./Skip";
import Translation from "./Translation";

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formMasterId: string
  @Column() @Serializable
  nameTranslationId: string
  @Column({type: 'integer'}) @Serializable
  version: number
  @Column() @Serializable
  isPublished: boolean

  @Relationship(Section)
  sections: Section[]
  @Relationship(Skip)
  skips: Skip[]
  @Relationship(Translation)
  nameTranslation: Translation

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    // Simple way to convert into an integer and then to a boolean. Possible values for this are "1", "0", 1, 0, true, false
    // and all of them are interpreted correctly by this statement
    this.isPublished = !!+this.isPublished
    return this
  }
}
