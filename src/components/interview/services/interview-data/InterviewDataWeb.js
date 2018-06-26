import http from '@/services/http/AxiosInstance'
export default class InterviewDataWeb {
  /**
   * Send a data patch to the server
   * @param interviewId
   * @param diff
   * @returns {Promise<T>}
   */
  static sendDiff (interviewId, diff) {
    interviewId = encodeURIComponent(interviewId)
    return http().post(`interview/${interviewId}/data`, diff).then(res => {
      return res.data
    })
  }
}

