import StudyLocale from "../../entities/trellis/StudyLocale";
import LocaleServiceAbstract from './LocaleServiceAbstract'
import Locale from '../../entities/trellis/Locale'
import StudyService from '../study/StudyService'
import DatabaseService from '../database/DatabaseService'

class LocaleServiceCordova extends LocaleServiceAbstract {
  async getLocaleById (localeId: string): Promise<Locale> {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Locale)
    return repository.findOne({ id: localeId, deletedAt: null })
  }

  async getStudyLocales (studyId: string): Promise<Locale[]> {
    const study = await StudyService.getStudy(studyId)
    console.log('study', study)
    return study ? await study.locales : []
  }

  async getAllLocales (): Promise<Locale[]> {
    throw new Error('not implemented')
  }

  async addStudyLocale (studyId: string, locale: Locale): Promise<StudyLocale> {
    throw new Error('Not Implemented')
  }

  async removeStudyLocale (studyId: string, locale: Locale): Promise<void> {
    throw new Error('Not implemented')
  }
}

export default new LocaleServiceCordova()
