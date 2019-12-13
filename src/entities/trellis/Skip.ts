import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Form from './Form'
import QuestionGroup from './QuestionGroup'
import SkipConditionTag from './SkipConditionTag'

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
    constructor: () => SkipConditionTag,
    jsonKey: 'conditions'
  })
  @OneToMany(type => SkipConditionTag, sct => sct.skip, { eager: true })
  conditionTags: SkipConditionTag[]

  // Inverse relationships
  @ManyToMany(type => Form)
  forms: Form[]
  @ManyToMany(type => QuestionGroup, qg => qg.skips)
  questionGroups: QuestionGroup

  fromSnakeJSON (json: any): this {
    super.fromSnakeJSON(json)
    for (let key of ['showHide', 'anyAll']) {
      if (typeof this[key] === 'string') {
        this[key] = this[key] === '1' || this[key] === 'true'
      } else {
        this[key] = !!this[key]
      }
    }
    return this
  }

}
