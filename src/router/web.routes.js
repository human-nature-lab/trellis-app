// import Interview from '../components/interview/Interview'
// import RespondentsSearch from '../components/respondent/RespondentsSearch'
// import SyncAdmin from '../components/sync/admin/SyncAdmin.vue'
import ValidateLocale from './guards/ValidateLocale'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'

const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview')
const RespondentsSearch = () => import(/* webpackChunkName: "respondents-search" */'../components/respondent/RespondentsSearch')
const SyncAdmin = () => import(/* webpackChunkName: "sync-admin" */'../components/sync/admin/SyncAdmin.vue')

export default [{
  path: '/',
  name: 'Home',
  component: RespondentsSearch,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}, {
  path: '/sync-admin',
  name: 'SyncAdmin',
  component: SyncAdmin
}, {
  path: '/form/:formId/preview',
  name: 'InterviewPreview',
  component: Interview,
  beforeEnter: chain(ValidateStudy, ValidateLocale)
}]
