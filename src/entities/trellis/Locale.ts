import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class Locale extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ nullable: true }) @Serializable
  languageTag: string
  @Column({ nullable: true }) @Serializable
  languageName: string
  @Column({ nullable: true }) @Serializable
  languageNative: string
}
