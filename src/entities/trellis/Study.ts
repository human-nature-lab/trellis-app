import { ManyToMany, JoinTable, JoinColumn, Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Locale from './Locale'

@Entity()
export default class Study extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
  @Column({ type: 'tinyint' }) @Serializable
  photoQuality: number
  @Column() @Serializable
  defaultLocaleId: string
  @Column() @Serializable
  testStudyId: string

  @Relationship(type => Locale)
  @ManyToMany(type => Locale)
  @JoinTable({ name: 'study_locale' })
  locales: Locale[]

  @Relationship(type => Locale)
  @ManyToOne(type => Locale, locale => locale.studyDefaults)
  @JoinColumn()
  defaultLocale: Locale

  @Relationship(type => Study)
  @OneToOne(type => Study)
  testStudy?: Study
}
