import LocaleService from '../../services/locale/LocaleService'
import SingletonService from '../../services/SingletonService'

export default async function (to, from, next) {
  console.log('ValidateLocale')
  await SingletonService.hasLoaded()
  let hasValidLocale = await LocaleService.hasValidLocale()
  if (!hasValidLocale) {
    return next({path: '/locale', query: {to: to.fullPath}})
  } else {
    console.log('valid locale')
    return next()
  }
}
