import LocaleServiceAbstract from './LocaleServiceAbstract'
import Locale from '../../entities/trellis/Locale'
import http from '../http/AxiosInstance'

class LocaleServiceWeb extends LocaleServiceAbstract {
  async getLocaleById (localeId: string): Promise<Locale> {
    const res = await http().get(`/locale/${localeId}`)
    return new Locale().fromJSON(res.data.locale)
  }

  async getStudyLocales (studyId: string): Promise<Locale[]> {
    const res = await http().get(`/study/${studyId}/locales`)
    let locales: Locale[] = []
    for (let i = 0; i < res.data.locales.length; i++) {
      locales.push(new Locale().fromJSON(res.data.locales[i]))
    }
    return locales
  }
}

export default new LocaleServiceWeb()
