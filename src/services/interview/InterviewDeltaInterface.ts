import QuestionDatum from "../../entities/trellis/QuestionDatum";
import Datum from "../../entities/trellis/Datum";
import SurveyConditionTag from "../../entities/trellis/SurveyConditionTag";
import SectionConditionTag from "../../entities/trellis/SectionConditionTag";
import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag";
import {mapCamelToPlain} from "../JSONUtil";
import SnakeSerializable from "../../entities/interfaces/SnakeSerializable";

export class AddedRemovedDelta<T> implements SnakeSerializable {
  /**
   * Added and removed data structure
   * @param {any[]} added
   * @param {any[]} removed
   */
  constructor (public added: any[], public removed: any[]) {}

  fromSnakeJSON () { return this }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}

export class ModifiedDelta<T> extends AddedRemovedDelta<T>{
  /**
   * Modified delta data structure
   * @param {any[]} added
   * @param {any[]} removed
   * @param {any[]} modified
   */
  constructor (added: any[], removed: any[], public modified: any[]) {
    super(added, removed)
  }
}


export class DataDelta implements SnakeSerializable {
  /**
   * Data structure for datum portion of InterviewDeltaInterface
   * @param {ModifiedDelta<Datum>} datum
   * @param {ModifiedDelta<QuestionDatum>} questionDatum
   */
  constructor (public datum: ModifiedDelta<Datum>, public questionDatum: ModifiedDelta<QuestionDatum>) {}

  fromSnakeJSON () { return this }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}

export class ConditionTagDelta implements SnakeSerializable {
  /**
   * Data structure for condition tag portion of InterviewDeltaInterface
   * @param {AddedRemovedDelta<SurveyConditionTag>} survey
   * @param {AddedRemovedDelta<SectionConditionTag>} section
   * @param {AddedRemovedDelta<RespondentConditionTag>} respondent
   */
  constructor(
    public survey?: AddedRemovedDelta<SurveyConditionTag>,
    public section?: AddedRemovedDelta<SectionConditionTag>,
    public respondent?: AddedRemovedDelta<RespondentConditionTag>
  ) {}

  fromSnakeJSON () { return this }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}

export default class InterviewDeltaInterface implements SnakeSerializable {
  /**
   * Data structure for an InterviewState delta object
   * @param {DataDelta} data
   * @param {ConditionTagDelta} conditionTags
   */
  constructor (public data: DataDelta, public conditionTags: ConditionTagDelta) {}

  fromSnakeJSON () { return this }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}
