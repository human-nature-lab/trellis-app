const Sync = () => import(/* webpackChunkName: "sync" */'../components/sync/Sync')
const Logs = () => import(/* webpackChunkName: "logs" */'../components/Logs')
const Storage = () => import(/* webpackChunkName: "storage" */'../components/Storage')

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
}]
