import LocaleService from '@/services/locale'
import SingletonService, { StorageKey } from '@/services/SingletonService'
import StorageService from '@/services/StorageService'
import { GuardConfig } from '../GuardQueue'

export default {
  name: 'LocaleGuard',
  async condition () {
    const localeId = StorageService.get(StorageKey.locale)
    if (localeId) {
      try {
        const locale = await LocaleService.getLocaleById(localeId)
        SingletonService.setCurrentLocale(locale)
      } catch (err) {
        StorageService.delete(StorageKey.locale)
      }
    }
    return LocaleService.hasValidLocale()
  },
  redirect () {
    return { name: 'LocaleSelector' }
  },
} as GuardConfig
