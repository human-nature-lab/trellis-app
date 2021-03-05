import { guardQueue } from './GuardQueue'
import LocaleGuard from './guards/LocaleGuard'
import StudyGuard from './guards/StudyGuard'
import PermissionGuard from './guards/PermissionGuard'
import { TrellisPermission } from '../static/permissions.base'

const Forms = () => import(/* webpackChunkName: "forms" */'../views/Forms.vue')
const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview.vue')
const RespondentsSearch = () => import(/* webpackChunkName: "respondents-search" */'../components/respondent/RespondentsSearch.vue')
const SyncAdmin = () => import(/* webpackChunkName: "sync-admin" */'../components/sync/admin/SyncAdmin.vue')
const Users = () => import(/* webpackChunkName: "users" */'../views/Users.vue')
const Reports = () => import(/* webpackChunkName: "reports" */'../views/Reports.vue')
const FormBuilder = () => import(/* webpackChunkName: "form-builder" */'../views/FormBuilder.vue')
const Devices = () => import(/* webpackChunkName: "devices" */'../views/Devices.vue')
const Studies = () => import(/* webpackChunkName: "studies" */'../views/Studies.vue')
const GeoTypes = () => import(/* webpackChunkName: "geo-types" */'../views/GeoTypes.vue')
const ServerConfig = () => import(/* webpackChunkName: "server-config" */'../views/ServerConfig.vue')
const DemoSignUp = () => import(/* webpackChunkName: "signup" */'../views/DemoSignUp.vue')
const EmailConfirmation = () => import(/* webpackChunkName: "confirmation" */'../views/EmailConfirmation.vue')
const Permissions = () => import(/* webpackChunkName: "permissions" */'../views/Permissions.vue')
const StudyDashboard = () => import(/* webpackChunkName: "study-dashboard" */'../views/StudyDashboard.vue')

export default [{
  path: '/',
  name: 'Home',
  component: StudyDashboard,
  beforeEnter: guardQueue([StudyGuard])
}, {
  path: '/sync-admin',
  name: 'SyncAdmin',
  component: SyncAdmin
}, {
  path: '/form/:formId/preview',
  name: 'InterviewPreview',
  component: Interview,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/user',
  name: 'Users',
  component: Users,
  beforeEnter: guardQueue([PermissionGuard(TrellisPermission.VIEW_USERS)])
}, {
  path: '/reports',
  name: 'Reports',
  component: Reports,
  beforeEnter: guardQueue([PermissionGuard(TrellisPermission.VIEW_REPORTS), StudyGuard])
}, {
  path: '/form/:formId/builder',
  name: 'FormBuilder',
  component: FormBuilder,
  beforeEnter: guardQueue([PermissionGuard(TrellisPermission.EDIT_FORM), StudyGuard, LocaleGuard])
}, {
  path: '/forms',
  name: 'Forms',
  component: Forms,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/devices',
  name: 'Devices',
  component: Devices,
  beforeEnter: guardQueue([PermissionGuard(TrellisPermission.VIEW_DEVICES)])
}, {
  path: '/studies',
  name: 'Studies',
  component: Studies,
  beforeEnter: guardQueue([PermissionGuard(TrellisPermission.VIEW_STUDIES)])
}, {
  path: '/geo-types',
  name: 'GeoTypes',
  component: GeoTypes,
  beforeEnter: guardQueue([StudyGuard, LocaleGuard])
}, {
  path: '/server-config',
  name: 'ServerConfig',
  component: ServerConfig
}, {
  path: '/demo-signup',
  name: 'DemoSignUp',
  component: DemoSignUp
}, {
  path: '/email-confirmation/:key',
  name: 'EmailConfirmation',
  component: EmailConfirmation
}, {
  path: '/permissions',
  name: 'Permissions',
  component: Permissions
}]
