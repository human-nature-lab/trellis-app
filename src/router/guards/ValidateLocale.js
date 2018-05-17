import LocaleService from '../../services/locale/LocaleService'

export default function (to, from, next) {
  if (!LocaleService.hasValidLocale()) {
    return next({path: '/locale', query: {to: to.path}})
  } else {
    return next()
  }
}
