import Interview from '../components/interview/Interview'
import RespondentForms from '../components/respondent/RespondentForms'
import RespondentsSearch from '../components/respondent/RespondentsSearch'
import CameraTest from '../components/CameraTest'
import GeoSearch from '../components/geo/GeoSearch'
import GeoInfo from '../components/geo/GeoInfo'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
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
  path: '/locale',
  name: 'locale',
  component: LocaleSelectorPage
}, {
  path: '/camera',
  name: 'camera',
  component: CameraTest
}, {
  path: '/search/locations',
  name: 'GeoSearch',
  component: GeoSearch,
  beforeEnter: ValidateLocale
}, {
  path: '/geo/:geoId',
  name: 'Geo',
  component: GeoInfo,
  beforeEnter: ValidateLocale
}]
