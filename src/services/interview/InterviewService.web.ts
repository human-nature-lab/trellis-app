import http from '../http/AxiosInstance'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'

import InterviewServiceAbstract from './InterviewServiceAbstract'
import Interview from '../../entities/trellis/Interview'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import { Coordinates } from '../geolocation/GeoLocationAbstract'

export default class InterviewServiceWeb extends InterviewServiceAbstract {
  async getInterview (interviewId: string) {
    const res = await http().get(`interview/${interviewId}`)
    return new Interview().fromSnakeJSON(res.data.interview)
  }

  async getActions (interviewId: string): Promise<Action[]> {
    interviewId = encodeURI(interviewId)
    const res = await http().get(`interview/${interviewId}/actions`)
    return res.data.actions.map(a => new Action().fromSnakeJSON(a))
  }

  async saveActions (interviewId: string, actions: Action[]) {
    interviewId = encodeURI(interviewId)
    const nActions = actions.map(a => a.toSnakeJSON())
    return http().post(`interview/${interviewId}/actions`, {
      actions: nActions,
    }).then(r => r.data)
  }

  async getData (interviewId: string) {
    const res = await http().get(`interview/${interviewId}/data`)
    return {
      data: res.data.data.map(q => (new QuestionDatum()).fromSnakeJSON(q)),
      conditionTags: {
        survey: res.data.conditionTags.survey.map(s => (new SurveyConditionTag()).fromSnakeJSON(s)),
        section: res.data.conditionTags.section.map(s => (new SectionConditionTag()).fromSnakeJSON(s)),
        respondent: res.data.conditionTags.respondent.map(r => (new RespondentConditionTag()).fromSnakeJSON(r)),
      },
    }
  }

  async saveData (interviewId: string, diff: InterviewDeltaInterface) {
    interviewId = encodeURIComponent(interviewId)
    const d = diff.toSnakeJSON()
    const res = await http().post(`interview/${interviewId}/data`, d)
    if (res.status >= 200 && res.status < 300) {
      return res.data
    } else {
      throw Error(`Status code: ${res.status}. Unable to save data.`)
    }
  }

  getPreload (interviewId: string): Promise<any> {
    return new Promise(resolve => resolve([]))
  }

  complete (interviewId: string): Promise<any> {
    return http().post(`interview/${interviewId}/complete`)
  }

  async create (surveyId: string, coordinates?: Coordinates): Promise<Interview> {
    const data = {
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
    }
    if (coordinates) {
      data.latitude = coordinates.latitude
      data.longitude = coordinates.longitude
      data.altitude = coordinates.altitude
      data.accuracy = coordinates.accuracy
    }
    const res = await http().post(`survey/${surveyId}/interview`, data)
    return new Interview().fromSnakeJSON(res.data.interview)
  }

  async getLatestInterviewPosition (respondentId: string, tolerance: number): Promise<null|Coordinates> {
    throw new Error('not implemented')
  }
}
