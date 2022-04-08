import Datum from "../../../entities/trellis/Datum";
import QuestionDatum from "../../../entities/trellis/QuestionDatum";
import { InterviewLocation } from "../services/InterviewAlligator";
import DataStore from "./DataStore";
import InterviewManager from "./InterviewManager";

type API = {
  vars: ReturnType<typeof createVarsProxy>
  tags: ReturnType<typeof createTagsProxy>
  data: ReturnType<typeof createDataProxy>
}

export function createSkipApi(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({} as API, {
    get(target, name: string) {
      if (target[name]) {
        return target[name]
      }
      switch (name) {
        case 'vars':
          target.vars = createVarsProxy(interview, location)
          return target.vars
        case 'tags':
          target.tags = createTagsProxy(interview.data, location)
          return target.tags
        case 'data':
          target.data = createDataProxy(interview, location)
          return target.data
      }
      return target[name]
    }
  })
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

// Support for full data access
export function createDataProxy(interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get(target, varName: string, receiver) {
      return new VarDataWrapper(interview, location, varName)
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


class VarDataWrapper {
  constructor(private interview: InterviewManager, private location: InterviewLocation, private varName: string) { }

  get currentData() {
    const qd = this.currentQuestionDatum
    if (!qd) {
      return
    }
    if (this.location.sectionFollowUpDatumId) {
      return qd.data[this.location.sectionFollowUpRepetition]
    }
    return qd.data
  }

  get val() {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d[0].val : d.val
  }

  get vals() {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d.map(d => d.val) : [d.val]
  }

  get joinedVals() {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d.map(d => d.val).join(', ') : d.val
  }

  get firstDatum() {
    return this.currentData ? this.currentData[0] : undefined
  }

  get currentQuestionDatum() {
    return this.interview.getSingleDatumByQuestionVarName(this.varName, this.location.sectionFollowUpDatumId)
  }

  get allQuestionDatum() {
    return this.interview.getAllQuestionDatumByVarName(this.varName)
  }
}