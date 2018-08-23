import Sync from '../components/sync/Sync'
import WebLogin from '../components/login/WebLogin.vue'

export default [{
  path: '/',
  name: 'Sync',
  component: Sync
}, {
  path: '/sync',
  name: 'Sync',
  component: Sync
}, {
  path: '/login',
  name: 'Login',
  component: WebLogin
}, {
  path: '*',
  redirect: '/'
}]
