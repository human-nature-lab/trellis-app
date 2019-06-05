import chain from './guards/ChainableGuards'
import ValidateServerConfig from './guards/ValidateServerConfig'
import ValidateDeviceKey from './guards/ValidateDeviceKey'

const Sync = () => import(/* webpackChunkName: "sync" */'../views/Sync')
const Logs = () => import(/* webpackChunkName: "logs" */'../views/Logs')
const Storage = () => import(/* webpackChunkName: "storage" */'../views/Storage')
const RegisterDevice = () => import(/* webpackChunkName: "register-device" */'../views/RegisterDevice')
const ConfigureServer = () => import(/* webpackChunkName: "configure-server" */'../views/ServerIPConfig')

export default [{
  path: '/',
  name: 'Home',
  component: Sync,
  beforeEnter: chain(ValidateServerConfig, ValidateDeviceKey)
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync,
  beforeEnter: chain(ValidateServerConfig, ValidateDeviceKey)
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
  beforeEnter: ValidateDeviceKey
}, {
  path: '/configure-server',
  name: 'ConfigureServer',
  component: ConfigureServer,
  beforeEnter: ValidateServerConfig
}]
