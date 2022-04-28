import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Translation from './Translation'
import Question from './Question'

@Entity()
export default class Choice extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  choiceTranslationId: string

  @Column('text') @Serializable
  val: string

  @Relationship(type => Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  choiceTranslation: Translation

  parameters?: object // Assigned and used by InterviewManager
}
