// import Interview from '../components/interview/Interview'
import RespondentForms from '../components/respondent/RespondentForms'
import RespondentsSearch from '../components/respondent/RespondentsSearch'
import RespondentInfo from '../components/respondent/RespondentInfo'
import CameraTest from '../components/CameraTest'
import Geo from '../components/geo/Geo'
import GeoInfo from '../components/geo/GeoInfo'
import GeoSearchWithMap from '../components/geo/GeoSearchWithMap'
import LocaleSelectorPage from '../components/LocaleSelectorPage'
import StudySelectorPage from '../components/StudySelectorPage'
import SurveyComplete from '../components/interview/SurveyComplete'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidateLocale from './guards/ValidateLocale'
import ValidateCensusForm from './guards/ValidateCensusForm'
import ValidateCompletedSurvey from './guards/ValidateCompletedSurvey'
import CensusFormLoaderPage from '../components/CensusFormLoaderPage'
import WebLogin from '../components/login/WebLogin'
import TrellisInfo from '../components/TrellisInfo'

const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview')
const ServiceTesting = () => import(/* webpackChunkName: "service-testing" */'../components/ServiceTesting')
const LocationHistory = () => import(/* webpackChunkName: "location-history" */'../components/LocationHistory')
// const TrellisInfo = () => import(/* webpackChunkName: "trellis-info" */'../components/TrellisInfo')

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: chain(ValidateStudy, ValidateCompletedSurvey)
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
  component: Geo,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/search/locations/map/:geoId',
  name: 'GeoSearchWithMap',
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
}, {
  path: '/login',
  name: 'Login',
  component: WebLogin
}, {
  path: '/study',
  name: 'StudySelector',
  component: StudySelectorPage
}, {
  path: '/test/services',
  name: 'ServiceTesting',
  component: ServiceTesting
}, {
  path: '/survey/:surveyId/completed',
  name: 'SurveyComplete',
  component: SurveyComplete
}, {
  path: '/location-history',
  name: 'LocationHistory',
  component: LocationHistory
}, {
  path: '/info',
  name: 'Info',
  component: TrellisInfo
}]
