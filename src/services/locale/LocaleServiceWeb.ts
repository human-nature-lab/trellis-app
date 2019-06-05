import StudyLocale from "../../entities/trellis/StudyLocale";
import {uriTemplate} from "../http/WebUtils";
import LocaleServiceAbstract from './LocaleServiceAbstract'
import Locale from '../../entities/trellis/Locale'
import http, {adminInst} from '../http/AxiosInstance'

class LocaleServiceWeb extends LocaleServiceAbstract {
  async getLocaleById (localeId: string): Promise<Locale> {
    const res = await http().get(uriTemplate('/locale/{locale}', [localeId]))
    return new Locale().fromSnakeJSON(res.data.locale)
  }

  async getStudyLocales (studyId: string): Promise<Locale[]> {
    const res = await http().get(uriTemplate('/study/{study}/locales', [studyId]))
    return res.data.locales.map(l => new Locale().fromSnakeJSON(l))
  }

  async getAllLocales (): Promise<Locale[]> {
    const res = await adminInst.get('locale')
    return res.data.locales.map(l => new Locale().fromSnakeJSON(l))
  }

  async addStudyLocale (studyId: string, locale: Locale): Promise<StudyLocale> {
    const res = await adminInst.post(uriTemplate('/study/{study}/locales/{locale}', [studyId, locale.id]))
    return new StudyLocale().fromSnakeJSON(res.data.study_locale)
  }

  async removeStudyLocale (studyId: string, locale: Locale): Promise<void> {
    const res = await adminInst.delete(uriTemplate('/study/{study}/locale/{locale}', [studyId, locale.id]))
    if (res.status > 205) {
      throw new Error('Unable to remove study locale')
    }
  }
}

export default new LocaleServiceWeb()
