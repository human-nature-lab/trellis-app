import http from '@/services/http/AxiosInstance'
export default class InterviewActionsWeb {
  /**
   * Save the actions that have been passed into this method
   * @param actions
   * @returns {Promise<Array>} - An array of actions
   */
  static saveActions (interviewId, actions) {
    interviewId = encodeURI(interviewId)
    return http().post(`interview/${interviewId}/actions`, {
      'actions': actions
    }).then(res => {
      return res.data
    })
  }

  /**
   * Get the actions that have been recorded for this interview
   */
  static getActions (interviewId) {
    interviewId = encodeURI(interviewId)
    return http().get(`interview/${interviewId}/actions`).then(res => {
      return res.data.actions
    })
  }
}
