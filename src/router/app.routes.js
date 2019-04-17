const Sync = () => import(/* webpackChunkName: "sync" */'../views/Sync')
const Logs = () => import(/* webpackChunkName: "logs" */'../views/Logs')
const Storage = () => import(/* webpackChunkName: "storage" */'../views/Storage')
const RegisterDevice = () => import(/* webpackChunkName: "register-device" */'../views/RegisterDevice')

export default [{
  path: '/',
  name: 'Home',
  component: Sync
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync
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
  component: RegisterDevice
}]
