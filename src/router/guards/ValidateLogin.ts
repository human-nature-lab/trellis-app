import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'
import LoginService from '../../services/login'
import config from 'config'

export default async function (to, from, next) {
<<<<<<< HEAD:src/router/guards/ValidateLogin.ts
  if (['Sync', 'Info', 'Documentation', 'ConfigureServer', 'RegisterDevice'].indexOf(to.name) > -1) {
=======
  const user = await UserService.getCurrentUser()
  if (to.name === 'Sync' || to.name === 'Info' || to.name === 'Documentation' || to.name === 'Login') {
>>>>>>> master:src/router/guards/ValidateLogin.js
    // Whitelisted pages
    return next()
  }
  const user = await UserService.getCurrentUser()
  if (!user && config && config.user) {
    await LoginService.login(config.user.username, config.user.password)
    next()
<<<<<<< HEAD:src/router/guards/ValidateLogin.ts
  } else if (!(user instanceof User) && to.name !== 'Login') {
    console.log('redirecting to login')
=======
  } else if (!(user instanceof User)) {
>>>>>>> master:src/router/guards/ValidateLogin.js
    next({name: 'Login', query: {to: to.fullPath}})
  } else {
    next()
  }
}
