import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Locale from "./Locale";

@Entity()
export default class TranslationText extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  translationId: string
  @Column({ nullable: true })
  localeId: string
  @Column('text')
  translatedText: string

  locale: Locale

  // Aliases
  get translated_text () { return this.translatedText }
  get locale_id () { return this.localeId }

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'translation_id', 'locale_id', 'translated_text', 'updated_at', 'created_at', 'deleted_at'])
    mapFromSnakeJSON(this, json, {
      locale: Locale
    })
    super.fromSnakeJSON(json)
    return this
  }
}
