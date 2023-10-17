import { IsNull } from 'typeorm'
import DatabaseService from '../database'
import TranslationText from '@/entities/trellis/TranslationText'
import Translation from '@/entities/trellis/Translation'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'

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
        deletedAt: IsNull(),
      },
    })
  }

  async getTranslationById (translationId: string): Promise<Translation> {
    const repo = await DatabaseService.getRepository(Translation)
    return repo.findOne({ id: translationId })
  }
}

export default new TranslationTextServiceCordova()
