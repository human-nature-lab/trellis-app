import http from '@/services/http/AxiosInstance'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'
let savedInterviewId
export default class InterviewServiceWeb {
  static setInterviewId (interviewId) {
    savedInterviewId = interviewId
  }
  static getInterviewId () {
    return savedInterviewId
  }
  static getInterview (interviewId) {
    return http().get(`interview/${interviewId}`)
      .then(function (res) {
        if (res.data.interview) {
          return res.data.interview
        } else {
          throw Error(`Unable to fetch interview with id: ${interviewId}`)
        }
      })
  }

  /**
   * Returns the existing action for this interview
   * @param {string} interviewId
   * @returns {Array<Action>}
   */
  static getActions (interviewId) {
    return http().get(`interview/${interviewId}/actions`)
      .then(function (res) {
        if (res.data.actions) {
          return res.data.actions
        } else {
          throw Error(`Unable to fetch actions for interview with id: ${interviewId}`)
        }
      })
  }

  /**
   * Get existing data for a single interview
   * @param {string} interviewId
   * @returns {{
   *  data: Array<QuestionDatum>,
   *  conditionTags: {
   *    survey: Array<SurveyConditionTag>,
   *    section: Array<SectionConditionTag>,
   *    respondent: Array<RespondentConditionTag>
   *  }
   * }
   */
  static getData (interviewId) {
    return http().get(`interview/${interviewId}/data`)
      .then(function (res) {
        if (res.data) {
          let d = {
            data: res.data.map(q => (new QuestionDatum()).fromJSON(q)),
            conditionTags: {
              survey: res.data.conditionTags.survey.map(s => (new SurveyConditionTag()).fromJSON(s)),
              section: res.data.conditionTags.section.map(s => (new SectionConditionTag()).fromJSON(s)),
              respondent: res.data.conditionTags.respondent.map(r => (new RespondentConditionTag()).fromJSON(r))
            }
          }
          console.log(d)
          debugger
          return d
        } else {
          throw Error(`Unable to fetch data for interview with id: ${interviewId}`)
        }
      })
  }

  /**
   * Not used at the moment
   * @param {string} interviewId
   * @returns {Promise<any>}
   */
  static getPreload (interviewId) {
    return new Promise(resolve => resolve([]))
  }

  /**
   * Mark the survey/interview as complete
   * @param {String} interviewId
   * @returns {*|AxiosPromise<any>}
   */
  static complete (interviewId) {
    return http().post(`interview/${interviewId}/complete`)
  }

  /**
   * Create a new interview for the specified survey
   * @param {String} surveyId
   * @returns {*|AxiosPromise<any>}
   */
  static create (surveyId) {
    return http().post(`survey/${surveyId}/interview`).then(res => {
      return res.data.interview
    })
  }
}
