import http from '@/services/http/AxiosInstance'
export default class ActionService {
  getInterviewActions (interviewId) {
    return http().get(`interview/${interviewId}/actions`)
      .then(function (res) {
        if (res.data.actions) {
          return res.data.actions
        } else {
          throw Error('Unable to load actions')
        }
      })
  }
}
