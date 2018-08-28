import {OneToOne, ManyToMany, JoinTable, JoinColumn, Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
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

  @Relationship(Locale)
  @ManyToMany(type => Locale)
  @JoinTable({ name: 'study_locale' })
  locales: Promise<Locale[]>

  @OneToOne(type => Locale)
  @JoinColumn()
  @Relationship(Locale)
  defaultLocale: Locale
}
