import Interview from '../components/interview/Interview'
import RespondentForms from '../components/respondent/RespondentForms'
import RespondentsSearch from '../components/respondent/RespondentsSearch'
import RespondentInfo from '../components/respondent/RespondentInfo'
import CameraTest from '../components/CameraTest'
import GeoSearchWithMap from '../components/geo/GeoSearchWithMap'
import GeoInfo from '../components/geo/GeoInfo'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidateLocale from './guards/ValidateLocale'
import ValidateCensusForm from './guards/ValidateCensusForm'
import CensusFormLoaderPage from '../components/CensusFormLoaderPage'
import StudySelectorPage from '../components/StudySelectorPage'

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: ValidateStudy
}, {
  path: '/',
  name: 'StudySelector',
  component: StudySelectorPage
}, {
  path: '/study/:studyId/respondent/:respondentId/forms',
  name: 'RespondentForms',
  component: RespondentForms,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/search/respondents',
  name: 'RespondentsSearch',
  component: RespondentsSearch,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/locale',
  name: 'locale',
  component: LocaleSelectorPage,
  beforeEnter: ValidateStudy
}, {
  path: '/camera',
  name: 'camera',
  component: CameraTest
}, {
  path: '/search/locations',
  name: 'GeoSearch',
  component: GeoSearchWithMap,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/geo/:geoId',
  name: 'Geo',
  component: GeoInfo,
  beforeEnter: ValidateLocale
}, {
  path: '/study/:studyId/respondent/:respondentId',
  name: 'Respondent',
  component: RespondentInfo,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/study/:studyId/census/:censusTypeId',
  name: 'StartCensusForm',
  component: CensusFormLoaderPage,
  beforeEnter: chain(ValidateStudy, ValidateLocale, ValidateCensusForm)
}]
