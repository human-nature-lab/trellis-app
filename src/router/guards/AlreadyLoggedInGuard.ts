import { Route } from 'vue-router'
import LoginGuard from './LoginGuard'

export default {
  name: 'AlreadyLoggedInGuard',
  async condition (to: Route) {
    return to.name === 'Login' || !(await LoginGuard.condition(to))
  }
}
