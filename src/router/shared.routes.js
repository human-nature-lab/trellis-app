import storage from '@/services/storage/StorageService'
import Interview from '@/components/interview/Interview'
import RespondentForms from '@/components/RespondentForms'
import RespondentsSearch from '@/components/RespondentsSearch'
import QuestionExamples from '@/components/interview/QuestionExamples'

function redirectIfNotValidInterview (to, from, next) {
  if (storage.get('interview-id') === null) {
    next({name: 'Login'})
  } else {
    next()
  }
}

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: redirectIfNotValidInterview
}, {
  path: '/study/:studyId/respondent/:respondentId/forms',
  name: 'RespondentForms',
  component: RespondentForms
}, {
  path: '/search/respondents',
  name: 'RespondentsSearch',
  component: RespondentsSearch
}, {
  path: '/question/examples',
  name: 'QuestionExamples',
  component: QuestionExamples
}]
