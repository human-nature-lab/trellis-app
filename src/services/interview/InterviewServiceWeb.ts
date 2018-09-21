import http from '../http/AxiosInstance'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'

import InterviewServiceInterface from './InterviewServiceInterface'
import Interview from '../../entities/trellis/Interview'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import GeoLocationService from '../geolocation'

export default class InterviewServiceWeb implements InterviewServiceInterface {

  async getInterview (interviewId: string) {
    let res = await http().get(`interview/${interviewId}`)
    return new Interview().fromSnakeJSON(res.data.interview)
  }

  async getActions (interviewId: string): Promise<Action[]> {
    interviewId = encodeURI(interviewId)
    let res = await http().get(`interview/${interviewId}/actions`)
    return res.data.actions.map(a => new Action().fromSnakeJSON(a))
  }

  async saveActions (interviewId: string, actions: Action[]) {
    interviewId = encodeURI(interviewId)
    let nActions = actions.map(a => a.toSnakeJSON())
    return http().post(`interview/${interviewId}/actions`, {
      'actions': nActions
    }).then(r => r.data)
  }

  async getData (interviewId: string) {
    let res = await http().get(`interview/${interviewId}/data`)
    return {
      data: res.data.data.map(q => (new QuestionDatum()).fromSnakeJSON(q)),
      conditionTags: {
        survey: res.data.conditionTags.survey.map(s => (new SurveyConditionTag()).fromSnakeJSON(s)),
        section: res.data.conditionTags.section.map(s => (new SectionConditionTag()).fromSnakeJSON(s)),
        respondent: res.data.conditionTags.respondent.map(r => (new RespondentConditionTag()).fromSnakeJSON(r))
      }
    }
  }

  saveData (interviewId: string, diff: InterviewDeltaInterface) {
    interviewId = encodeURIComponent(interviewId)
    let d = diff.toSnakeJSON()
    return http().post(`interview/${interviewId}/data`, d).then(res => res.data)
  }

  getPreload (interviewId: string): Promise<any> {
    return new Promise(resolve => resolve([]))
  }

  complete (interviewId: string): Promise<any> {
    return http().post(`interview/${interviewId}/complete`)
  }

  async create (surveyId: string): Promise<Interview> {
    let data = {
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null
    }
    let position
    try {
      position = await GeoLocationService.getCurrentPosition()
    } catch (err) {
      console.error('This user did not provide access to their location')
      console.error(err)
    }
    if (position) {
      data.latitude = position.coords.latitude
      data.longitude = position.coords.longitude
      data.altitude = position.coords.altitude
      data.accuracy = position.coords.accuracy
    }
    let res = await http().post(`survey/${surveyId}/interview`, data)
    return new Interview().fromSnakeJSON(res.data.interview)
  }

}
