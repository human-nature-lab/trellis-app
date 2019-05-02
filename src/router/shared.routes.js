import Geo from '../components/geo/Geo'
import SurveyComplete from '../components/interview/SurveyComplete'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidateLocale from './guards/ValidateLocale'
import ValidateCensusForm from './guards/ValidateCensusForm'
import ValidateCompletedSurvey from './guards/ValidateCompletedSurvey'
import CensusFormLoaderPage from '../components/CensusFormLoaderPage'
import WebLogin from '../views/WebLogin'

const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview')
const ServiceTesting = () => import(/* webpackChunkName: "service-testing" */'../views/ServiceTesting')
const LocationHistory = () => import(/* webpackChunkName: "location-history" */'../components/LocationHistory')
const TrellisInfo = () => import(/* webpackChunkName: "trellis-info" */'../views/TrellisInfo')
const GeoSearchWithMap = () => import(/* webpackChunkName: "geo-search" */'../components/geo/GeoSearchWithMap')
const LocaleSelectorPage = () => import(/* webpackChunkName: "locale-selector" */'../views/LocaleSelectorPage')
const StudySelectorPage = () => import(/* webpackChunkName: "study-selector" */'../views/StudySelectorPage')
const RespondentsSearch = () => import(/* webpackChunkName: "respondent-search" */'../components/respondent/RespondentsSearch')
const RespondentForms = () => import(/* webpackChunkName: "respondent-forms" */'../components/respondent/RespondentForms')
const RespondentInfo = () => import(/* webpackChunkName: "respondent-info" */'../components/respondent/RespondentInfo')
const DocsRoute = () => import(/* webpackChunkName: "documentation" */'../components/documentation/DocsRoute')
const Changelog = () => import(/* webpackChunkName: "changelog" */'../components/Changelog')
const GeoInfo = () => import(/* webpackChunkName: "geo-info" */'../components/geo/GeoInfo')

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
}, {
  path: '/documentation/:filePath?',
  name: 'Documentation',
  component: DocsRoute
}, {
  path: '/changelog',
  name: 'Changelog',
  component: Changelog
}]
