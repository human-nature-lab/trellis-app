import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Section from './Section'
import Skip from './Skip'
import Translation from './Translation'

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ select: false }) @Serializable
  formMasterId: string
  @Column({ select: false }) @Serializable
  nameTranslationId: string
  @Column({type: 'integer'}) @Serializable
  version: number
  @Column() @Serializable
  isPublished: boolean

  @Relationship(type => Section)
  @ManyToMany(type => Section, section => section.forms)
  @JoinTable({ name: 'form_section' })
  sections: Section[]

  @Relationship(type => Skip)
  @ManyToMany(type => Skip, skip => skip.forms, { eager: true })
  @JoinTable({ name: 'form_skip' })
  skips: Skip[]

  @Relationship(type => Translation)
  @OneToOne(type => Translation, {eager: true})
  @JoinColumn()
  nameTranslation: Translation

  // Inverse relationships
  @OneToOne(type => Form)
  form: Form

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    // Simple way to convert into an integer and then to a boolean. Possible values for this are '1', '0', 1, 0, true, false
    // and all of them are interpreted correctly by this statement
    this.isPublished = !!+this.isPublished
    return this
  }
  
  sort () {
    this.sections.sort((a, b) => {
      return b.formSections[0].sortOrder - a.formSections[0].sortOrder
    })
    for (const section of this.sections) {
      section.questionGroups.sort((a, b) => {
        return b.sectionQuestionGroup.questionGroupOrder - a.sectionQuestionGroup.questionGroupOrder
      })
      for (const page of section.questionGroups) {
        page.questions.sort((a, b) => b.sortOrder - a.sortOrder)
        page.skips.sort((a, b) => b.precedence - a.precedence)
        for (const question of page.questions) {
          if (question.choices) {
            question.choices.sort((a, b) => b.sortOrder - a.sortOrder)
          }
        }
      }
    }
  }
}
