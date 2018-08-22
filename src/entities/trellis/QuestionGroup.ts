import {Entity, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";
import Skip from "./Skip";

@Entity()
export default class QuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @Relationship(Question)
  questions: Question[]
  @Relationship({
    constructor: SectionQuestionGroup,
    jsonKey: 'pivot'
  })
  sectionQuestionGroup: SectionQuestionGroup
  @Relationship(Skip)
  skips: Skip[]

}
