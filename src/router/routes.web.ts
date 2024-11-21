import { guardQueue } from './GuardQueue'
import LocaleGuard from './guards/LocaleGuard'
import StudyGuard from './guards/StudyGuard'
import PermissionGuard from './guards/PermissionGuard'
import sharedRoutes from './shared.routes'
import { TrellisPermission } from '../static/permissions.base'
import LoginGuard from './guards/LoginGuard'

const Forms = () => import(/* webpackChunkName: "forms" */'@/views/form/Forms.vue')
const Interview = () => import(/* webpackChunkName: "interview" */'@/views/Interview.vue')
const RespondentsSearch = () => import(/* webpackChunkName: "respondents-search" */'@/views/respondent/RespondentsSearch.vue')
const SyncAdmin = () => import(/* webpackChunkName: "sync-admin" */'@/views/sync/SyncAdmin.vue')
const Users = () => import(/* webpackChunkName: "users" */'@/views/admin/Users.vue')
const Reports = () => import(/* webpackChunkName: "reports" */'@/views/admin/Reports.vue')
const OldFormBuilder = () => import(/* webpackChunkName: "old-form-builder" */'@/views/form/OldFormBuilder.vue')
const FormBuilder = () => import(/* webpackChunkName: "form-builder" */'@/views/form/FormBuilder.vue')
const FormPrint = () => import(/* webpackChunkName: "form-print" */'@/views/form/FormPrint.vue')
const FormTranslations = () => import(/* webpackChunkName: "form-translations" */'@/views/form/FormTranslations.vue')
const Devices = () => import(/* webpackChunkName: "devices" */'@/views/admin/Devices.vue')
const Studies = () => import(/* webpackChunkName: "studies" */'@/views/study/Studies.vue')
const GeoTypes = () => import(/* webpackChunkName: "geo-types" */'@/views/geo/GeoTypes.vue')
const ServerConfig = () => import(/* webpackChunkName: "server-config" */'@/views/admin/ServerConfig.vue')
const DemoSignUp = () => import(/* webpackChunkName: "signup" */'@/views/demo/DemoSignUp.vue')
const EmailConfirmation = () => import(/* webpackChunkName: "confirmation" */'@/views/demo/EmailConfirmation.vue')
const Permissions = () => import(/* webpackChunkName: "permissions" */'@/views/admin/Permissions.vue')
const StudyDashboard = () => import(/* webpackChunkName: "study-dashboard" */'@/views/study/StudyDashboard.vue')
const DataImport = () => import(/* webpackChunkName: "data-import" */'@/views/admin/DataImport.vue')

export default sharedRoutes.concat([{
  path: '/',
  name: 'Home',
  default: true,
  component: StudyDashboard,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/sync-admin',
  name: 'SyncAdmin',
  component: SyncAdmin,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/form/:formId/preview',
  name: 'InterviewPreview',
  component: Interview,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/user',
  name: 'Users',
  component: Users,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_USERS)]),
}, {
  path: '/reports',
  name: 'Reports',
  component: Reports,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_REPORTS), StudyGuard]),
}, {
  path: '/import-data',
  name: 'DataImport',
  component: DataImport,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.IMPORT_RESPONDENTS), StudyGuard]),
}, {
  path: '/form/:formId/old-builder',
  name: 'OldFormBuilder',
  component: OldFormBuilder,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.EDIT_FORM), StudyGuard, LocaleGuard]),
}, {
  path: '/form/:formId/builder',
  name: 'FormBuilder',
  component: FormBuilder,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.EDIT_FORM), StudyGuard, LocaleGuard]),
}, {
  path: '/form/:formId/print',
  name: 'FormPrint',
  component: FormPrint,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.EDIT_FORM), StudyGuard]),
}, {
  path: '/form/:formId/translations',
  name: 'FormTranslations',
  component: FormTranslations,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.EDIT_FORM), StudyGuard]),
}, {
  path: '/forms',
  name: 'Forms',
  component: Forms,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/devices',
  name: 'Devices',
  component: Devices,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_DEVICES)]),
}, {
  path: '/studies',
  name: 'Studies',
  component: Studies,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_STUDIES)]),
}, {
  path: '/geo-types',
  name: 'GeoTypes',
  component: GeoTypes,
  beforeEnter: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
}, {
  path: '/server-config',
  name: 'ServerConfig',
  component: ServerConfig,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_CONFIG)]),
}, {
  path: '/demo-signup',
  name: 'DemoSignUp',
  component: DemoSignUp,
}, {
  path: '/email-confirmation/:key',
  name: 'EmailConfirmation',
  component: EmailConfirmation,
}, {
  path: '/permissions',
  name: 'Permissions',
  component: Permissions,
  beforeEnter: guardQueue([LoginGuard, PermissionGuard(TrellisPermission.VIEW_PERMISSIONS)]),
}])
