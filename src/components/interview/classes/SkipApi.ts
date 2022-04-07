import Datum from "src/entities/trellis/Datum";
import { InterviewLocation } from "../services/InterviewAlligator";
import DataStore from "./DataStore";
import InterviewManager from "./InterviewManager";

export function createSkipApi(interview: InterviewManager) {
  const vars = createVarsProxy(interview, interview.location)
  const tags = createTagsProxy(interview.data, interview.location)
  const data = createDataProxy(interview, interview.location)
  return { vars, tags, data }
}

export function createTagsProxy(data: DataStore, location: InterviewLocation) {
  return new Proxy({} as Record<string, boolean>, {
    get(target, conditionTagName: string, receiver) {
      return data.hasConditionTag(conditionTagName, location.sectionRepetition, location.sectionFollowUpDatumId)
    }
  })
}

function getVarNameData(varName: string, interview: InterviewManager, location: InterviewLocation): Datum | Datum[] | undefined {
  const qd = interview.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpDatumId)
  console.log(varName, qd)
  if (!qd) {
    return
  }
  if (location.sectionFollowUpDatumId) {
    return qd.data[location.sectionFollowUpRepetition]
  }
  return qd.data
}

// Support for old-style access to the data in the form
export function createDataProxy(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get(target, varName: string, receiver) {
      return getVarNameData(varName, interview, location)
    }
  }) as Record<string, Datum | Datum[]>
}

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
  })
}