import WebLogin from '../components/login/WebLogin'
import Interview from '../components/interview/Interview'
import storage from '../services/storage/StorageService'

export default [{
  path: '/login',
  name: 'login',
  component: WebLogin,
  beforeEnter: function (to, from, next) {
    if (storage.get('interview-id') !== null) {
      next({name: 'Interview', params: {studyId: storage.get('studyId'), interviewId: storage.get('interview-id')}})
    } else {
      next()
    }
  }
}, {
  path: '/form/:formId/preview',
  name: 'InterviewPreview',
  component: Interview
}]
