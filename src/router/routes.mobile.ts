import AlreadyConfiguredServerGuard from './guards/AlreadyConfiguredServerGuard'
import AlreadyHaveDeviceKeyGuard from './guards/AlreadyHaveDeviceKeyGuard'
import ServerConfigGuard from './guards/ServerConfigGuard'
import DeviceKeyGuard from './guards/DeviceKeyGuard'
import { guardQueue } from './GuardQueue'
import sharedRoutes from './shared.routes'

const Sync = () => import(/* webpackChunkName: "sync" */'../views/Sync.vue')
const Logs = () => import(/* webpackChunkName: "logs" */'../views/Logs.vue')
const Storage = () => import(/* webpackChunkName: "storage" */'../views/Storage.vue')
const RegisterDevice = () => import(/* webpackChunkName: "register-device" */'../views/RegisterDevice.vue')
const ConfigureServer = () => import(/* webpackChunkName: "configure-server" */'../views/ServerIPConfig.vue')

export default sharedRoutes.concat([{
  path: '/',
  name: 'Home',
  component: Sync,
  beforeEnter: guardQueue([ServerConfigGuard, DeviceKeyGuard])
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync,
  beforeEnter: guardQueue([ServerConfigGuard, DeviceKeyGuard])
}, {
  path: '/logs',
  name: 'Logs',
  component: Logs
}, {
  path: '/storage',
  name: 'Storage',
  component: Storage
}, {
  path: '/register-device',
  name: 'RegisterDevice',
  component: RegisterDevice,
  beforeEnter: guardQueue([ServerConfigGuard, AlreadyHaveDeviceKeyGuard])
}, {
  path: '/configure-server',
  name: 'ConfigureServer',
  component: ConfigureServer,
  beforeEnter: guardQueue([AlreadyConfiguredServerGuard])
}])
