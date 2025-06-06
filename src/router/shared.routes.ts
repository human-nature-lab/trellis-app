import { RouteConfig } from 'vue-router'
import AlreadyLoggedInGuard from './guards/AlreadyLoggedInGuard'
import { guardQueue } from './GuardQueue'
import StudyGuard from './guards/StudyGuard'
import LocaleGuard from './guards/LocaleGuard'
import CensusFormGuard from './guards/CensusFormGuard'
import CompletedSurveyGuard from './guards/CompletedSurveyGuard'
import SurveyComplete from '../components/interview/SurveyComplete.vue'
import CensusFormLoaderPage from '../components/CensusFormLoaderPage.vue'
import WebLogin from '../views/WebLogin.vue'
import docs from '../components/documentation/docs'
import LoginGuard from './guards/LoginGuard'

const Interview = () => import(/* webpackChunkName: "interview" */'@/views/Interview.vue')
const ServiceTesting = () => import(/* webpackChunkName: "service-testing" */'@/views/ServiceTesting.vue')
const LocationHistory = () => import(/* webpackChunkName: "location-history" */'@/views/info/LocationHistory.vue')
const TrellisInfo = () => import(/* webpackChunkName: "trellis-info" */'@/views/info/TrellisInfo.vue')
const GeoSearchWithMap = () => import(/* webpackChunkName: "geo-search" */'@/views/geo/GeoSearchWithMap.vue')
const LocaleSelectorPage = () => import(/* webpackChunkName: "locale-selector" */'@/views/study/LocaleSelectorPage.vue')
const StudySelectorPage = () => import(/* webpackChunkName: "study-selector" */'@/views/study/StudySelectorPage.vue')
const RespondentsSearch = () => import(/* webpackChunkName: "respondent-search" */'@/views/respondent/RespondentsSearch.vue')
const RespondentForms = () => import(/* webpackChunkName: "respondent-forms" */'@/views/respondent/RespondentForms.vue')
const RespondentInfo = () => import(/* webpackChunkName: "respondent-info" */'@/views/respondent/RespondentInfo.vue')
const DocsRoute = () => import(/* webpackChunkName: "documentation" */'@/views/DocsRoute.vue')
const Changelog = () => import(/* webpackChunkName: "changelog" */'@/views/info/Changelog.vue')
const GeoInfo = () => import(/* webpackChunkName: "geo-info" */'@/views/geo/GeoInfo.vue')
const Geo = () => import(/* webpackChunkName: "geo-search" */'@/views/geo/Geo.vue')
const Theme = () => import(/* webpackChunkName: "theme" */'@/views/Theme.vue')
const Assets = () => import(/* webpackChunkName: "assets" */'@/views/assets/Assets.vue')
const Asset = () => import(/* webpackChunkName: "asset" */'@/views/assets/Asset.vue')
const Test = () => import(/* webpackChunkName: "test" */'@/views/Test.vue')

console.log('docs', docs)
const docsRoutes = Object.keys(docs.content).map(path => ({
  path: path === 'Home.md' ? '' : encodeURI(path),
  name: path,
  default: path === 'Home.md',
  component: docs.content[path],
}))

console.log('docs routes', docsRoutes)

export default [{
  path: '/study/:studyId/interview/:interviewId',
  name: 'Interview',
  component: Interview,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, CompletedSurveyGuard]),
}, {
  path: '/study/:studyId/respondent/:respondentId/forms',
  name: 'RespondentForms',
  component: RespondentForms,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/search/respondents',
  name: 'RespondentsSearch',
  component: RespondentsSearch,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/locale',
  name: 'LocaleSelector',
  component: LocaleSelectorPage,
  beforeEnter: guardQueue([LoginGuard, StudyGuard]),
}, {
  path: '/search/locations',
  name: 'GeoSearch',
  component: Geo,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/search/locations/map/:geoId',
  name: 'GeoSearchWithMap',
  component: GeoSearchWithMap,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/geo/:geoId',
  name: 'Geo',
  component: GeoInfo,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/study/:studyId/respondent/:respondentId',
  name: 'Respondent',
  component: RespondentInfo,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/study/:studyId/census/:censusTypeId',
  name: 'StartCensusForm',
  component: CensusFormLoaderPage,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard, CensusFormGuard]),
}, {
  path: '/login',
  name: 'Login',
  component: WebLogin,
  beforeEnter: guardQueue([AlreadyLoggedInGuard]),
}, {
  path: '/study',
  name: 'StudySelector',
  component: StudySelectorPage,
  beforeEnter: guardQueue([LoginGuard]),
}, {
  path: '/test/services',
  name: 'ServiceTesting',
  component: ServiceTesting,
}, {
  path: '/survey/:surveyId/completed',
  name: 'SurveyComplete',
  component: SurveyComplete,
  beforeEnter: guardQueue([LoginGuard]),
}, {
  path: '/location-history',
  name: 'LocationHistory',
  component: LocationHistory,
  beforeEnter: guardQueue([LoginGuard]),
}, {
  path: '/info',
  name: 'Info',
  component: TrellisInfo,
}, {
  path: '/documentation/',
  name: 'Documentation',
  component: DocsRoute,
  children: docsRoutes,
}, {
  path: '/changelog',
  name: 'Changelog',
  component: Changelog,
}, {
  path: '/theme',
  name: 'Theme',
  component: Theme,
}, {
  path: '/assets',
  name: 'Assets',
  component: Assets,
  beforeEnter: guardQueue([LoginGuard]),
}, {
  path: '/asset/:id',
  name: 'Asset',
  component: Asset,
  beforeEnter: guardQueue([LoginGuard]),
}, {
  path: '/test',
  name: 'Test',
  component: Test,
  beforeEnter: guardQueue([LoginGuard]),
}] as RouteConfig[]
