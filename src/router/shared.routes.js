import Interview from '../components/interview/Interview'
import RespondentForms from '../components/RespondentForms'
import RespondentsSearch from '../components/RespondentsSearch'
import CameraTest from '../components/CameraTest'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import QuestionExamples from '../components/interview/QuestionExamples'
import validateLocale from './guards/ValidateLocale'
import validateStudy from './guards/ValidateStudy'
import loadInterview from './guards/LoadInterview'
import chainableGuards, {parallel} from './guards/ChainableGuards'

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: chainableGuards(parallel(validateLocale, validateStudy), loadInterview)
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
  path: '/camera',
  name: 'camera',
  component: CameraTest
}]
