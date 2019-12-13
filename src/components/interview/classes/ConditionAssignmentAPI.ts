import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import QT from '../../../static/question.types'
import { isUndefined } from '../../../services/util'
import InterviewAlligator from '../services/InterviewAlligator'
import DataStore from './DataStore'

interface SimpleLocation {
  page: number
  section: number
  sectionRepetition: number
  sectionFollowUpRepetition: number
}

export interface ConditionAssignmentAPI {
  data: {
    get (varName: string, sectionFollowUpRepetition?: number, sectionRepetition?: number): string | string[] | null
  },
  conditionTag: {
    exists (tagName: string): boolean
  },
  state: SimpleLocation
}

function mapDatumByQuestionType (questionTypeId: string, questionDatum: QuestionDatum): string | string[] | null {
  switch (questionTypeId) {
    case QT.relationship:
    case QT.roster:
    case QT.multiple_select:
    case QT.geo:
    case QT.respondent_geo:
    case QT.image:
      return questionDatum.data.map(d => d.val)
    default:
      return questionDatum.data && questionDatum.data.length ? questionDatum.data[0].val : null
  }
}

/**
 * We secure the data and navigator data structures from modification by accessing them via a function closure instead
 * of assigning them to class properties which would allow them to be accessed by code which had access to call the API
 * @param data
 * @param navigator
 */
export function createConditionAssignmentAPI (data: DataStore, navigator: InterviewAlligator): ConditionAssignmentAPI {
  return {
    data: {
      get (varName: string, sectionFollowUpRepetition?: number, sectionRepetition?: number): string | string[] | null {
        if (isUndefined(sectionFollowUpRepetition)) {
          sectionFollowUpRepetition = navigator.loc.sectionFollowUpRepetition
        }
        if (isUndefined(sectionRepetition)) {
          sectionRepetition = navigator.loc.sectionRepetition
        }
        const loc = navigator.getLocByVarName(varName, sectionFollowUpRepetition, sectionRepetition)

        if (isUndefined(loc)) return null

        const questionDatum = data.getSingleQuestionDatumByLocation(loc.questionId, loc.sectionRepetition, loc.sectionFollowUpDatumId)

        return mapDatumByQuestionType(loc.questionTypeId, questionDatum)
      }
    },
    conditionTag: {
      exists (conditionTagName: string): boolean {
        return data.hasConditionTag(conditionTagName, navigator.loc.sectionRepetition, navigator.loc.sectionFollowUpDatumId)
      }
    },
    get state (): SimpleLocation {
      return {
        page: navigator.loc.page,
        section: navigator.loc.section,
        sectionRepetition: navigator.loc.sectionRepetition,
        sectionFollowUpRepetition: navigator.loc.sectionFollowUpRepetition
      }
    }
  }
}
