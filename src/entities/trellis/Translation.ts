import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string

  translationText: Array<TranslationText>

  get translation_text () {
    return this.translationText
  }

  fromSnakeJSON (json: any) {
    mapPropsFromJSON(this, json, ['id', 'created_at', 'updated_at', 'deleted_at'])
    mapFromSnakeJSON(this, json, {
      translationText: TranslationText
    })
    super.fromSnakeJSON(json)
    return this
  }
}
