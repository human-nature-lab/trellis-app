import Edge from '../../../entities/trellis/Edge'
import Datum from '../../../entities/trellis/Datum'
import { InterviewLocation } from '../services/InterviewAlligator'
import DataStore from './DataStore'
import InterviewManager from './InterviewManager'

type API = {
  vars: ReturnType<typeof createVarsProxy>
  tags: ReturnType<typeof createTagsProxy>
  data: ReturnType<typeof createDataProxy>
  location: InterviewLocation
  interview: InterviewManager
  cache: Map<any, any>
  followUpDatum?: Datum
  memo: <T>(key: string, fn: () => T) => T
  getEdge: ReturnType<typeof getEdge>
  getDatum: ReturnType<typeof getDatum>
}

export function createSkipApi (interview: InterviewManager, location: InterviewLocation, cache: Map<any, any>) {
  return new Proxy({
    location,
    interview,
    memo: memo(cache),
    cache,
    getEdge: getEdge(interview),
    getDatum: getDatum(interview),
  } as API, {
    get (target, name: string) {
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
        case 'followUpDatum':
          target.followUpDatum = interview.data.getDatumById(location.sectionFollowUpDatumId)
          return target.followUpDatum
      }
      return target[name]
    },
  })
}

function getEdge (interview: InterviewManager) {
  return function (id: string) {
    return interview.data.edges.get(id)
  }
}

function getDatum (interview: InterviewManager) {
  return function (id: string) {
    return interview.data.getDatumById(id)
  }
}

function memo (cache: Map<any, any>) {
  return function<T> (key: string, fn: () => T): T {
    if (cache.has(key)) {
      return cache.get(key)
    }
    const res = fn()
    cache.set(key, res)
    return res
  }
}

function getVarNameData (
  varName: string,
  interview: InterviewManager,
  location: InterviewLocation,
): Datum | Datum[] | undefined {
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
export function createTagsProxy (data: DataStore, location: InterviewLocation) {
  return new Proxy({} as Record<string, boolean>, {
    get (target, conditionTagName: string, receiver) {
      return data.hasConditionTag(conditionTagName, location.sectionRepetition, location.sectionFollowUpDatumId)
    },
  }) as Record<string, boolean>
}

// Support for full data access
export function createDataProxy (interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get (target, varName: string, receiver) {
      return new VarDataWrapper(interview, location, varName)
    },
  })
}

// Support for legacy-style acces to data in the form. Should be identical to
// legacy condition assignment
export function createVarsProxy (interview: InterviewManager, location: InterviewLocation) {
  return new Proxy({}, {
    get (target, varName: string, receiver) {
      const d = getVarNameData(varName, interview, location)
      if (d) {
        if (Array.isArray(d)) {
          return d.length ? d[0].val : undefined
        } else {
          return d.val
        }
      }
    },
  }) as Record<string, string | number>
}

class VarDataWrapper {
  constructor (private interview: InterviewManager, private location: InterviewLocation, private varName: string) { }

  get currentData () {
    const qd = this.currentQuestionDatum
    if (!qd) {
      return
    }
    if (this.location.sectionFollowUpDatumId) {
      return qd.data[this.location.sectionFollowUpRepetition]
    }
    return qd.data
  }

  get currentEdge () {
    const d = this.currentData
    if (!d) {
      return
    }
    const edgeId = Array.isArray(d) ? d[0].edgeId : d.edgeId
    if (edgeId) {
      return this.interview.data.edges.get(edgeId)
    }
  }

  get allEdges () {
    const edges: Edge[] = []
    for (const qd of this.allQuestionDatum) {
      for (const d of qd.data) {
        if (d.edgeId) {
          edges.push(this.interview.data.edges.get(d.edgeId))
        }
      }
    }
    return edges
  }

  get val () {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d[0].val : d.val
  }

  get vals () {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d.map(d => d.val) : [d.val]
  }

  get joinedVals () {
    const d = this.currentData
    if (!d) {
      return
    }
    return Array.isArray(d) ? d.map(d => d.val).join(', ') : d.val
  }

  get firstDatum () {
    return this.currentData ? this.currentData[0] : undefined
  }

  get followUpDatum () {
    const qd = this.currentQuestionDatum
    return qd && qd.followUpDatumId ? this.interview.data.getDatumById(qd.followUpDatumId) : undefined
  }

  get currentQuestionDatum () {
    return this.interview.getSingleDatumByQuestionVarName(this.varName, this.location.sectionFollowUpDatumId)
  }

  get allQuestionDatum () {
    return this.interview.getAllQuestionDatumByVarName(this.varName)
  }
}
