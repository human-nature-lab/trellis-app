import AlreadyConfiguredServerGuard from './guards/AlreadyConfiguredServerGuard'
import AlreadyHaveDeviceKeyGuard from './guards/AlreadyHaveDeviceKeyGuard'
import ServerConfigGuard from './guards/ServerConfigGuard'
import DeviceKeyGuard from './guards/DeviceKeyGuard'
import { guardQueue } from './GuardQueue'
import sharedRoutes from './shared.routes'
import LoginGuard from './guards/LoginGuard'
import StudyGuard from './guards/StudyGuard'
import { extraRoutes } from '@/modules'

const Sync = () => import(/* webpackChunkName: "sync" */'@/views/sync/Sync.vue')
const Logs = () => import(/* webpackChunkName: "logs" */'@/views/info/Logs.vue')
const Storage = () => import(/* webpackChunkName: "storage" */'@/views/info/Storage.vue')
const RegisterDevice = () => import(/* webpackChunkName: "register-device" */'@/views/setup/RegisterDevice.vue')
const ConfigureServer = () => import(/* webpackChunkName: "configure-server" */'@/views/setup/ServerIPConfig.vue')
const HistoryView = () => import(/* webpackChunkName: "history" */'@/views/HistoryView.vue')
const FilesView = () => import(/* webpackChunkName: "files" */'@/views/FilesView.vue')

export default sharedRoutes.concat([{
  path: '/',
  name: 'Home',
  component: Sync,
  default: true,
  beforeEnter: guardQueue([LoginGuard, ServerConfigGuard, DeviceKeyGuard]),
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync,
  beforeEnter: guardQueue([ServerConfigGuard, DeviceKeyGuard]),
}, {
  path: '/logs',
  name: 'Logs',
  component: Logs,
}, {
  path: '/storage',
  name: 'Storage',
  component: Storage,
}, {
  path: '/register-device',
  name: 'RegisterDevice',
  component: RegisterDevice,
  beforeEnter: guardQueue([ServerConfigGuard, AlreadyHaveDeviceKeyGuard]),
}, {
  path: '/configure-server',
  name: 'ConfigureServer',
  component: ConfigureServer,
  beforeEnter: guardQueue([AlreadyConfiguredServerGuard]),
}, {
  path: '/history',
  name: 'HistoryView',
  component: HistoryView,
  beforeEnter: guardQueue([LoginGuard, StudyGuard]),
}, {
  path: '/files',
  name: 'Files',
  component: FilesView,
  beforeEnter: guardQueue([LoginGuard]),
}]).concat(extraRoutes.map(r => ({
  ...r,
  beforeEnter: guardQueue([LoginGuard, StudyGuard]),
})))
