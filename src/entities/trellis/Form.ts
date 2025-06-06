import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToMany, OneToOne, OneToMany } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Section from './Section'
import Skip from './Skip'
import Translation from './Translation'
import StudyForm from './StudyForm'
import Question from './Question'

@Entity()
export default class Form extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ type: 'uuid' }) @Serializable
  formMasterId: string

  @Column({ select: false, type: 'uuid' }) @Serializable
  nameTranslationId: string

  @Column({ type: 'integer' }) @Serializable
  version: number

  @Column('boolean') @Serializable
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
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  nameTranslation: Translation

  @Relationship(type => StudyForm)
  @OneToOne(type => StudyForm)
  studyForm: StudyForm

  // Inverse relationships
  @OneToOne(type => Form)
  form: Form

  @Relationship(type => Form)
  versions: Form[]

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    if (this.versions) {
      this.versions.sort((a, b) => b.version - a.version)
    }

    // Simple way to convert into an integer and then to a boolean. Possible values for this are '1', '0', 1, 0, true,
    // false and all of them are interpreted correctly by this statement
    this.isPublished = !!+this.isPublished
    return this
  }

  sort () {
    if (this.skips) {
      this.skips.sort((a, b) => {
        return a.precedence - b.precedence
      })
    }
    if (this.sections) {
      this.sections.sort((a, b) => {
        return a.formSections[0].sortOrder - b.formSections[0].sortOrder
      })
      for (const section of this.sections) {
        section.questionGroups.sort((a, b) => {
          return a.sectionQuestionGroup.questionGroupOrder - b.sectionQuestionGroup.questionGroupOrder
        })
        for (const page of section.questionGroups) {
          page.questions.sort((a, b) => a.sortOrder - b.sortOrder)
          page.skips.sort((a, b) => a.precedence - b.precedence)
          for (const question of page.questions) {
            if (question.choices) {
              question.choices.sort((a, b) => a.sortOrder - b.sortOrder)
            }
          }
        }
      }
    }
  }

  varNameQuestionMap () {
    const m = new Map<string, Question>()
    for (const section of this.sections) {
      for (const page of section.pages) {
        for (const question of page.questions) {
          m.set(question.varName, question)
        }
      }
    }
    return m
  }
}
