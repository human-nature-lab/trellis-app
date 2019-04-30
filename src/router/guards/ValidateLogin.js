import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'
import LoginService from '../../services/login'
import config from '../../config'

export default async function (to, from, next) {
  const user = await UserService.getCurrentUser()
  if (to.name === 'Sync' || to.name === 'Info' || to.name === 'Documentation' || to.name === 'Login') {
    // Whitelisted pages
    next()
  } else if (!user && config && config.user) {
    await LoginService.login(config.user.username, config.user.password)
    next()
  } else if (!(user instanceof User)) {
    next({name: 'Login', query: {to: to.fullPath}})
  } else {
    next()
  }
}
