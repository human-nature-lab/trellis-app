import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @OneToMany(type => TranslationText, translationText => translationText.translation, { eager: true })
  translationText: Array<TranslationText>

  toJSON () {
    return this
  }

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      translationText: TranslationText
    })
    super.fromSnakeJSON(json)
    return this
  }
}
