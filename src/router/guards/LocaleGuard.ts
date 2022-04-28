import LocaleService from '../../services/locale'
import SingletonService from '../../services/SingletonService'
import StorageService from '../../services/StorageService'
import { GuardConfig } from '../GuardQueue'

export async function oldGuard (to, from, next) {
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
    return next({ path: '/locale', query: { to: to.fullPath } })
  } else {
    return next()
  }
}

export default {
  name: 'LocaleGuard',
  async condition () {
    const localeId = StorageService.get('current-locale')
    if (localeId) {
      try {
        let locale = await LocaleService.getLocaleById(localeId)
        SingletonService.setCurrentLocale(locale)
      } catch (err) {
        StorageService.delete('current-locale')
      }
    }
    return LocaleService.hasValidLocale()
  },
  redirect () {
    return { name: 'LocaleSelector' }
  }
} as GuardConfig
