import {Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany, JoinTable, ManyToMany} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Section from './Section'
import Skip from './Skip'
import Translation from './Translation'
import {OneToOne} from "typeorm/browser";

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formMasterId: string
  @Column() @Serializable
  nameTranslationId: string
  @Column({type: 'integer'}) @Serializable
  version: number
  @Column() @Serializable
  isPublished: boolean

  @Relationship(Section)
  @ManyToMany(type => Section, section => section.forms)
  @JoinTable({ name: 'form_section' })
  sections: Section[]

  @Relationship(Skip)
  @ManyToMany(type => Skip, skip => skip.forms, { eager: true })
  @JoinTable({ name: 'form_skip' })
  skips: Skip[]

  @Relationship(Translation)
  @OneToOne(type => Translation, {eager: true})
  @JoinColumn()
  nameTranslation: Translation

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    // Simple way to convert into an integer and then to a boolean. Possible values for this are '1', '0', 1, 0, true, false
    // and all of them are interpreted correctly by this statement
    this.isPublished = !!+this.isPublished
    return this
  }
}
