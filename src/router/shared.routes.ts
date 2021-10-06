import { RouteConfig } from 'vue-router'
import AlreadyLoggedInGuard from './guards/AlreadyLoggedInGuard'
import { guardQueue } from './GuardQueue'
import StudyGuard from './guards/StudyGuard'
import LocaleGuard from './guards/LocaleGuard'
import CensusFormGuard from './guards/CensusFormGuard'
import CompletedSurveyGuard from './guards/CompletedSurveyGuard'
import Geo from '../components/geo/Geo.vue'
import SurveyComplete from '../components/interview/SurveyComplete.vue'
import CensusFormLoaderPage from '../components/CensusFormLoaderPage.vue'
import WebLogin from '../views/WebLogin.vue'

const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview.vue')
const ServiceTesting = () => import(/* webpackChunkName: "service-testing" */'../views/ServiceTesting.vue')
const LocationHistory = () => import(/* webpackChunkName: "location-history" */'../views/LocationHistory.vue')
const TrellisInfo = () => import(/* webpackChunkName: "trellis-info" */'../views/TrellisInfo.vue')
const GeoSearchWithMap = () => import(/* webpackChunkName: "geo-search" */'../components/geo/GeoSearchWithMap.vue')
const LocaleSelectorPage = () => import(/* webpackChunkName: "locale-selector" */'../views/LocaleSelectorPage.vue')
const StudySelectorPage = () => import(/* webpackChunkName: "study-selector" */'../views/StudySelectorPage.vue')
const RespondentsSearch = () => import(/* webpackChunkName: "respondent-search" */'../components/respondent/RespondentsSearch.vue')
const RespondentForms = () => import(/* webpackChunkName: "respondent-forms" */'../components/respondent/RespondentForms.vue')
const GeoForms = () => import(/* webpackChunkName: "geo-forms" */'../components/geo/GeoForms.vue')
const RespondentInfo = () => import(/* webpackChunkName: "respondent-info" */'../components/respondent/RespondentInfo.vue')
const DocsRoute = () => import(/* webpackChunkName: "documentation" */'../components/documentation/DocsRoute.vue')
const Changelog = () => import(/* webpackChunkName: "changelog" */'../components/Changelog.vue')
const GeoInfo = () => import(/* webpackChunkName: "geo-info" */'../components/geo/GeoInfo.vue')

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: guardQueue([StudyGuard, CompletedSurveyGuard])
}, {
  path: '/study/:studyId/respondent/:respondentId/forms',
  name: 'RespondentForms',
  component: RespondentForms,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/study/:studyId/geo/:geoId/forms',
  name: 'GeoForms',
  component: GeoForms,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/search/respondents',
  name: 'RespondentsSearch',
  component: RespondentsSearch,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/locale',
  name: 'LocaleSelector',
  component: LocaleSelectorPage,
  beforeEnter: guardQueue([StudyGuard])
}, {
  path: '/search/locations',
  name: 'GeoSearch',
  component: Geo,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/search/locations/map/:geoId',
  name: 'GeoSearchWithMap',
  component: GeoSearchWithMap,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/geo/:geoId',
  name: 'Geo',
  component: GeoInfo,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/study/:studyId/respondent/:respondentId',
  name: 'Respondent',
  component: RespondentInfo,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/study/:studyId/census/:censusTypeId',
  name: 'StartCensusForm',
  component: CensusFormLoaderPage,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard, CensusFormGuard])
}, {
  path: '/login',
  name: 'Login',
  component: WebLogin,
  beforeEnter: guardQueue([AlreadyLoggedInGuard])
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
}] as RouteConfig[]
