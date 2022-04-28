import { ManyToMany, JoinTable, JoinColumn, Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Locale from './Locale'

@Entity()
export default class Study extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  name: string

  @Column({ type: 'tinyint' }) @Serializable
  photoQuality: number

  @Column('uuid') @Serializable
  defaultLocaleId: string

  @Column('uuid') @Serializable
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
  @JoinColumn({ name: 'test_study_id' })
  testStudy?: Study
}
