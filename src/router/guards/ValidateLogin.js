import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'

export default async function (to, from, next) {
  const user = await UserService.getCurrentUser()
  if (user instanceof User) {
    next()
  } else if (to.name !== 'Login') {
    next({name: 'Login', query: {to: to.fullPath}})
  }
}