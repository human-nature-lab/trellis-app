import LoginService from '../../services/login'

export default async function (to, from, next) {
  const loggedIn = await LoginService.isLoggedIn()
  if (loggedIn) {
    next()
  } else if (to.name !== 'Login') {
    next({name: 'Login', query: {to: to.fullPath}})
  }
}
