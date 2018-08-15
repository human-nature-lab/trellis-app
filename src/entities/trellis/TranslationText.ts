import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
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
    mapFromSnakeJSON(this, json, {
      locale: Locale
    })
    super.fromSnakeJSON(json)
    return this
  }
}
