import InterviewService from '../../../../services/interview/InterviewService'
import http from '@/services/http/AxiosInstance'
export default class InterviewDataWeb {
  /**
   * Send a data patch to the server
   * @param interviewId
   * @param diff
   * @returns {Promise<T>}
   */
  static sendDiff (diff) {
    return http().post(`interview/${InterviewService.getInterviewId()}/data`, diff).then(res => {
      return res.data
    })
  }
}

