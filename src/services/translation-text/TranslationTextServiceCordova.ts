import DatabaseService from '../database/DatabaseService'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import {IsNull} from 'typeorm'

export default class TranslationTextServiceCordova implements TranslationTextServiceInterface {

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any> {
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
