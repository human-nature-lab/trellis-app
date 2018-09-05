import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import ConditionTag from './ConditionTag'
import Form from './Form'
import QuestionGroup from './QuestionGroup'

@Entity()
export default class Skip extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  showHide: boolean
  @Column() @Serializable
  anyAll: boolean
  @Column({ type: 'tinyint' }) @Serializable
  precedence: number

  @Relationship({
    constructor: () => ConditionTag,
    jsonKey: 'conditions'
  })
  conditionTags: ConditionTag[]

  // Inverse relationships
  @ManyToMany(type => Form)
  forms: Form[]
  @ManyToMany(type => QuestionGroup, qg => qg.skips)
  questionGroups: QuestionGroup

}
