import DatabaseService from '../database/DatabaseService'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import { IsNull } from 'typeorm'

class TranslationTextServiceCordova implements TranslationTextServiceInterface {

  async createTranslationText (translationId: string, translationText: TranslationText): Promise<TranslationText> {
    const repo = await DatabaseService.getRepository(TranslationText)
    translationText.translationId = translationId
    return repo.save(translationText)
  }

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<TranslationText> {
    const repo = await DatabaseService.getRepository(TranslationText)
    await repo.update({ id: translationTextId }, { translatedText: translatedText })
    return repo.findOne({ id: translationTextId })
  }

  async getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]> {
    const repo = await DatabaseService.getRepository(TranslationText)
    return repo.find({
      where: {
        translationId,
        deletedAt: IsNull()
      }
    })
  }
}

export default new TranslationTextServiceCordova()