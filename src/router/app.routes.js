import Sync from '../components/sync/Sync'
import Logs from '../components/Logs'
// const Sync = () => import()
// const Logs = () => import(/* webpackChunkName: "logs" */'../components/Logs')

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
}]
