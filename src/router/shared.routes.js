// import storage from '@/services/storage/StorageService'
import Interview from '@/components/interview/Interview'
import RespondentForms from '@/components/RespondentForms'
import RespondentsSearch from '@/components/RespondentsSearch'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import QuestionExamples from '@/components/interview/QuestionExamples'
import LocaleService from '../services/locale/LocaleService'
import StudyService from '../services/study/StudyService'

function beforeInterview (to, from, next) {
  StudyService.getStudy(to.params.studyId).then(study => {
    if (study) {
      StudyService.setCurrentStudy(study)
    } else {
      return next({path: '/'})
    }
    if (!LocaleService.hasValidLocale()) {
      return next({path: '/locale', query: {to: to.path}})
    }
    return next()
  })
}

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: beforeInterview
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
}, {
  path: '/locale',
  name: 'locale',
  component: LocaleSelectorPage
}, {
  path: '*',
  redirect: '/'
}]
