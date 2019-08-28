import { Route } from 'vue-router'
import LoginGuard from './LoginGuard'

export default {
  name: 'AlreadyLoggedInGuard',
  async condition (to: Route) {
    return !(await LoginGuard.condition(to))
  }
}
