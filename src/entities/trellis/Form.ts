import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import Section from "./Section";
import Skip from "./Skip";
import Translation from "./Translation";

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  formMasterId: string
  @Column()
  nameTranslationId: string
  @Column({type: 'integer'})
  version: number
  @Column()
  isPublished: boolean

  sections: Array<Section>
  skips: Array<Skip>
  nameTranslation: Translation

  fromSnakeJSON(json: any) {
    mapPropsFromJSON(this, json, [
      'id', 'form_master_id', 'name_translation_id', 'version', 'is_published'
    ])
    mapFromSnakeJSON(this, json, {
      sections: Section,
      skips: Skip,
      nameTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
  }
}
