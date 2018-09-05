import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'
import Skip from './Skip'
import {mapFromSnakeJSON} from '../../services/JSONUtil'

@Entity()
export default class QuestionGroupSkip extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionGroupId: string
  @Column() @Serializable
  skipId: string

  @Relationship(type => Skip)
  skip: Skip

}
