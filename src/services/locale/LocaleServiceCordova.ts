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
    return await study.locales
  }
}

export default new LocaleServiceCordova()
