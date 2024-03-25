import LocaleService from '@/services/locale'
import SingletonService from '@/services/SingletonService'
import StorageService from '@/services/StorageService'
import { GuardConfig } from '../GuardQueue'

export default {
  name: 'LocaleGuard',
  async condition () {
    const localeId = StorageService.get('current-locale')
    if (localeId) {
      try {
        const locale = await LocaleService.getLocaleById(localeId)
        SingletonService.setCurrentLocale(locale)
      } catch (err) {
        StorageService.delete('current-locale')
      }
    }
    return LocaleService.hasValidLocale()
  },
  redirect () {
    return { name: 'LocaleSelector' }
  },
} as GuardConfig
