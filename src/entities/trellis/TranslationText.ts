import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromJSON, mapPropsFromJSON} from "../../services/JSONUtil";
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

  fromJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'translation_id', 'locale_id', 'translated_text', 'updated_at', 'created_at', 'deleted_at'])
    mapFromJSON(this, json, {
      locale: Locale
    })
    return this
  }
}
