import ValidateLocale from './guards/ValidateLocale'
import chain from './guards/ChainableGuards'
import ValidateStudy from './guards/ValidateStudy'
import ValidatePermissions from './guards/ValidatePermissions'
import {TrellisPermission} from '../static/permissions.base'

const Forms = () => import(/* webpackChunkName: "forms" */'../views/Forms')
const Interview = () => import(/* webpackChunkName: "interview" */'../components/interview/Interview')
const RespondentsSearch = () => import(/* webpackChunkName: "respondents-search" */'../components/respondent/RespondentsSearch')
const SyncAdmin = () => import(/* webpackChunkName: "sync-admin" */'../components/sync/admin/SyncAdmin.vue')
const Users = () => import(/* webpackChunkName: "users" */'../views/Users')
const Reports = () => import(/* webpackChunkName: "reports" */'../views/Reports')
const FormBuilder = () => import(/* webpackChunkName: "form-builder" */'../views/FormBuilder')
const Devices = () => import(/* webpackChunkName: "devices" */'../views/Devices')
const Studies = () => import(/* webpackChunkName: "studies" */'../views/Studies')
const GeoTypes = () => import(/* webpackChunkName: "geo-types" */'../views/GeoTypes')

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
  component: Users,
  beforeEnter: ValidatePermissions(TrellisPermission.VIEW_USERS)
}, {
  path: '/reports',
  name: 'Reports',
  component: Reports,
  beforeEnter: chain(ValidatePermissions(TrellisPermission.VIEW_REPORTS), ValidateStudy)
}, {
  path: '/form/:formId/builder',
  name: 'FormBuilder',
  component: FormBuilder,
  beforeEnter: chain(ValidatePermissions(TrellisPermission.EDIT_FORM), ValidateStudy, ValidateLocale)
}, {
  path: '/forms',
  name: 'Forms',
  component: Forms,
  beforeEnter: chain(ValidateStudy)
}, {
  path: '/devices',
  name: 'Devices',
  component: Devices,
  beforeEnter: ValidatePermissions(TrellisPermission.VIEW_DEVICES)
}, {
  path: '/studies',
  name: 'Studies',
  component: Studies,
  beforeEnter: ValidatePermissions(TrellisPermission.VIEW_STUDIES)
}, {
  path: '/geo-types',
  name: 'GeoTypes',
  component: GeoTypes,
  beforeEnter: chain(ValidateStudy)
}]
