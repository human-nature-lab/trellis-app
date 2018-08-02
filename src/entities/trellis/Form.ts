import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
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

  fromJSON(json: any) {
    mapPropsFromJSON(this, json, [
      'id', 'form_master_id', 'name_translation_id', 'version', 'is_published'
    ])
    mapFromJSON(this, json, {
      sections: Section,
      skips: Skip,
      nameTranslation: Translation
    })
    return this
  }
}
