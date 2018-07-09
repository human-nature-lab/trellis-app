import Interview from '../components/interview/Interview'
import RespondentForms from '../components/respondent/RespondentForms'
import RespondentsSearch from '../components/respondent/RespondentsSearch'
import RespondentInfo from '../components/respondent/RespondentInfo'
import CameraTest from '../components/CameraTest'
import GeoSearch from '../components/geo/GeoSearch'
import GeoInfo from '../components/geo/GeoInfo'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import chainableGuards from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidateLocale from './guards/ValidateLocale'
import ValidateCensusForm from './guards/ValidateCensusForm'
import RedirectToCensusInterview from './guards/RedirectToCensusInterview'

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
}, {
  path: '/study/:studyId/respondent/:respondentId',
  name: 'Respondent',
  component: RespondentInfo,
  beforeEnter: chainableGuards(ValidateStudy, ValidateLocale)
}, {
  path: '/study/:studyId/census/:censusTypeId',
  name: 'StartCensusForm',
  beforeEnter: chainableGuards(ValidateStudy, ValidateLocale, ValidateCensusForm, RedirectToCensusInterview)
}]
