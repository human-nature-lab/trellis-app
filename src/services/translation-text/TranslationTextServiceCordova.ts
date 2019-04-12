import DatabaseService from '../database/DatabaseService'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import {IsNull} from 'typeorm'

export default class TranslationTextServiceCordova implements TranslationTextServiceInterface {

  async createTranslationText (translationId: string, translationText: TranslationText): Promise<TranslationText> {
    const repo = await DatabaseService.getRepository(TranslationText)
    translationText.translationId = translationId
    return repo.save(translationText)
  }

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<TranslationText> {
    const repository = await DatabaseService.getRepository(TranslationText)
    return repository.update({id: translationTextId}, {translatedText: translatedText})
  }

  async getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]> {
    const repo = await DatabaseService.getRepository(TranslationText)
    return await repo.find({
      where: {
        translationId,
        deletedAt: IsNull()
      }
    })
  }
}
