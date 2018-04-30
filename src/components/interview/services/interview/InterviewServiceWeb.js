import http from '@/services/http/AxiosInstance'
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
  static getData (interviewId) {
    return http().get(`interview/${interviewId}/data`)
      .then(function (res) {
        if (res.data.data) {
          return res.data.data
        } else {
          throw Error(`Unable to fetch data for interview with id: ${interviewId}`)
        }
      })
  }
}
