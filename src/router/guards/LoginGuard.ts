import { Route } from 'vue-router'
import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'
import LoginService from '../../services/login'
import config from 'config'
import RouteWhitelist from '../RouteWhitelist'

export default {
  name: 'LoginGuard',
  async condition (to: Route) {
    if (RouteWhitelist.indexOf(to.name) > -1) return true
    const user = await UserService.loadCurrentUser()
    if (!user && config && config.user) {
      await LoginService.login(config.user.username, config.user.password)
      return true
    } else if (user instanceof User) {
      return true
    }
  },
  redirect () {
    return { name: 'Login' }
  }
}
