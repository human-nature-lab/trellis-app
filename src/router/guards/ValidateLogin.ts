import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'
import LoginService from '../../services/login'
import config from 'config'

export default async function (to, from, next) {
  if (['Sync', 'Info', 'Documentation', 'ConfigureServer', 'RegisterDevice'].indexOf(to.name) > -1) {
    // Whitelisted pages
    return next()
  }
  const user = await UserService.getCurrentUser()
  if (!user && config && config.user) {
    await LoginService.login(config.user.username, config.user.password)
    next()
  } else if (!(user instanceof User) && to.name !== 'Login') {
    console.log('redirecting to login')
    next({name: 'Login', query: {to: to.fullPath}})
  } else {
    next()
  }
}
