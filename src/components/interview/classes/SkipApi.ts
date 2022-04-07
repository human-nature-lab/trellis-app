import Datum from "../../../entities/trellis/Datum";
import QuestionDatum from "../../../entities/trellis/QuestionDatum";
import { InterviewLocation } from "../services/InterviewAlligator";
import DataStore from "./DataStore";
import InterviewManager from "./InterviewManager";

export function createSkipApi(interview: InterviewManager, location: InterviewLocation) {
  const vars = createVarsProxy(interview, location)
  const tags = createTagsProxy(interview.data, location)
  const data = createDataProxy(interview, location)
  const qd = createQuestionDatumProxy(interview, location)
  return { vars, tags, data, qd }
}

function getVarNameData(varName: string, interview: InterviewManager, location: InterviewLocation): Datum | Datum[] | undefined {
  const qd = interview.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpDatumId)
  if (!qd) {
    return
  }
  if (location.sectionFollowUpDatumId) {
    return qd.data[location.sectionFollowUpRepetition]
  }
  return qd.data
}

// Check for the existence of condition tags
export function createTagsProxy(data: DataStore, location: InterviewLocation) {
  return new Proxy({} as Record<string, boolean>, {
    get(target, conditionTagName: string, receiver) {
      return data.hasConditionTag(conditionTagName, location.sectionRepetition, location.sectionFollowUpDatumId)
    }
  }) as Record<string, boolean>
}

// Support for direct access to the questionDatum object. To check dkRf and 
// noOne values
export function createQuestionDatumProxy(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get(target, varName: string, receiver) {
      return interview.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpDatumId)
    }
  }) as Record<string, QuestionDatum | void>
}

// Support for full data access
export function createDataProxy(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get(target, varName: string, receiver) {
      return getVarNameData(varName, interview, location)
    }
  }) as Record<string, Datum | Datum[]>
}

// Support for legacy-style acces to data in the form. Should be identical to 
// legacy condition assignment
export function createVarsProxy(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get(target, varName: string, receiver) {
      const d = getVarNameData(varName, interview, location)
      if (d) {
        if (Array.isArray(d)) {
          return d.length ? d[0].val : undefined
        } else {
          return d.val
        }
      }
    }
  }) as Record<string, string | number>
}