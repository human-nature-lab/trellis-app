import LocaleServiceAbstract from './LocaleServiceAbstract'
import Locale from '../../entities/trellis/Locale'
import http from '../http/AxiosInstance'

class LocaleServiceWeb extends LocaleServiceAbstract {
  async getLocaleById (localeId: string): Promise<Locale> {
    const res = await http().get(`/locale/${localeId}`)
    return new Locale().fromSnakeJSON(res.data.locale)
  }

  async getStudyLocales (studyId: string): Promise<Locale[]> {
    const res = await http().get(`/study/${studyId}/locales`)
    return res.data.locale.maps(l => new Locale().fromSnakeJSON(l))
  }
}

export default new LocaleServiceWeb()
