import LocaleService from '../../services/locale/LocaleService'
import SingletonService from '../../services/SingletonService'
import StorageService from '../../services/StorageService'

export default async function (to, from, next) {
  // If the user has previously selected a locale, load the locale into memory
  let localeId = StorageService.get('current-locale')
  if (localeId) {
    try {
      let locale = await LocaleService.getLocaleById(localeId)
      SingletonService.setCurrentLocale(locale)
    } catch (err) {
      // The ID is no longer valid
      StorageService.delete('current-locale')
    }
  }

  let hasValidLocale = await LocaleService.hasValidLocale()
  if (!hasValidLocale) {
    return next({path: '/locale', query: {to: to.fullPath}})
  } else {
    return next()
  }
}
