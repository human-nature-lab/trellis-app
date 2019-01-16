import ValidateLocale from './guards/ValidateLocale'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'

const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview')
const RespondentsSearch = () => import(/* webpackChunkName: "respondents-search" */'../components/respondent/RespondentsSearch')
const SyncAdmin = () => import(/* webpackChunkName: "sync-admin" */'../components/sync/admin/SyncAdmin.vue')
const Users = () => import(/* webpackChunkName: "users" */'../views/Users')

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
}, {
  path: '/user',
  name: 'Users',
  component: Users
}]
