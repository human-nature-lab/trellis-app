import http from '../http/AxiosInstance'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'

import InterviewServiceInterface from './InterviewServiceInterface'
import Interview from '../../entities/trellis/Interview'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'

export class InterviewServiceWeb implements InterviewServiceInterface {

  getInterview (interviewId: string) {
    return http().get(`interview/${interviewId}`)
      .then(function (res) {
        if (res.data.interview) {
          return res.data.interview
        } else {
          throw Error(`Unable to fetch interview with id: ${interviewId}`)
        }
      })
  }

  getActions (interviewId) {
    interviewId = encodeURI(interviewId)
    return http().get(`interview/${interviewId}/actions`).then(res => {
      return res.data.actions.map(a => new Action().fromSnakeJSON(a))
    })
  }

  saveActions (interviewId: string, actions: Action[]) {
    interviewId = encodeURI(interviewId)

    return http().post(`interview/${interviewId}/actions`, {
      'actions': actions.map(a => a.toSnakeJSON())
    }).then(res => {
      return res.data
    })
  }

  getData (interviewId: string) {
    return http().get(`interview/${interviewId}/data`)
      .then(function (res) {
        if (res.data) {
          let d = {
            data: res.data.data.map(q => (new QuestionDatum()).fromSnakeJSON(q)),
            conditionTags: {
              survey: res.data.conditionTags.survey.map(s => (new SurveyConditionTag()).fromSnakeJSON(s)),
              section: res.data.conditionTags.section.map(s => (new SectionConditionTag()).fromSnakeJSON(s)),
              respondent: res.data.conditionTags.respondent.map(r => (new RespondentConditionTag()).fromSnakeJSON(r))
            }
          }
          return d
        } else {
          throw Error(`Unable to fetch data for interview with id: ${interviewId}`)
        }
      })
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

  create (surveyId: string): Promise<Interview> {
    return http().post(`survey/${surveyId}/interview`).then(res => {
      return res.data.interview
    })
  }

}

export default new InterviewServiceWeb()
