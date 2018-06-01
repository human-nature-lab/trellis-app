import http from '@/services/http/AxiosInstance'
import InterviewService from '../../../../services/interview/InterviewService'
export default class InterviewActionsWeb {
  /**
   * Save the actions that have been passed into this method
   * @param actions
   * @returns {Promise<Array>} - An array of actions
   */
  static saveActions (actions) {
    return http().post(`interview/${InterviewService.getInterviewId()}/actions`, {
      'actions': actions
    }).then(res => {
      return res.data
    })
  }

  /**
   * Get the actions that have been recorded for this interview
   */
  static getActions () {
    return http().get(`interview/${InterviewService.getInterviewId()}/actions`).then(res => {
      return res.data.actions
    })
  }
}
