import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Study from './Study'

@Entity()
export default class Locale extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  languageTag: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  languageName: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  languageNative: string

  // Inverse
  @OneToMany(type => Study, study => study.defaultLocale)
  studyDefaults: Study[]
}
