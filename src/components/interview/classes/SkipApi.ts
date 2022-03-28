import { InterviewLocation } from "../services/InterviewAlligator";
import DataStore from "./DataStore";
import InterviewManager from "./InterviewManager";

export function createSkipApi (interview: InterviewManager) {
  const vars = createVarsProxy(interview, interview.location)
  const tags = createTagsProxy(interview.data, interview.location)
  return { vars, tags }
}

export function createTagsProxy(data: DataStore, location: InterviewLocation) {
  return new Proxy({} as Record<string, boolean>, {
    get (target, conditionTagName: string, receiver) {
      return data.hasConditionTag(conditionTagName, location.sectionRepetition, location.sectionFollowUpDatumId)
    }
  })
}

// Support for old-style access to the data in the form
export function createVarsProxy (interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({} as Record<string, any>, {
    get (target, varName: string, receiver) {
      const qd = interview.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpDatumId)
      if (location.sectionFollowUpDatumId) {
        return qd.data[location.sectionFollowUpRepetition].val
      }
      return qd.data[0].val
    }
  })
}