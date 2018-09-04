import Interview from '../components/interview/Interview'
import RespondentsSearch from '../components/respondent/RespondentsSearch'
import ValidateLocale from './guards/ValidateLocale'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'

export default [{
  path: '/',
  name: 'Home',
  component: RespondentsSearch,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/form/:formId/preview',
  name: 'InterviewPreview',
  component: Interview,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}]
