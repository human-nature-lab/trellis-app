// const Sync = () => import(/* webpackChunkName: "sync" */'../components/sync/Sync')
import Sync from '../components/sync/Sync'
export default [{
  path: '/',
  name: 'Home',
  component: Sync
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync
}, {
  path: '*',
  redirect: '/search/respondents'
}]
