import Interview from '../components/interview/Interview'
import RespondentForms from '../components/RespondentForms'
import RespondentsSearch from '../components/RespondentsSearch'
import CameraTest from '../components/CameraTest'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import QuestionExamples from '../components/interview/QuestionExamples'
import chainableGuards from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidateLocale from './guards/ValidateLocale'

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: chainableGuards(ValidateStudy)
}, {
  path: '/study/:studyId/respondent/:respondentId/forms',
  name: 'respondent-forms',
  component: RespondentForms,
  beforeEnter: chainableGuards(ValidateStudy, ValidateLocale)
}, {
  path: '/search/respondents',
  name: 'RespondentsSearch',
  component: RespondentsSearch,
  beforeEnter: chainableGuards(ValidateStudy, ValidateLocale)
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
