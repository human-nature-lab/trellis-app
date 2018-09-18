import DatabaseService from '../database/DatabaseService'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'

export default class TranslationTextServiceCordova implements TranslationTextServiceInterface {

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any> {
    const repository = await DatabaseService.getRepository(TranslationText)
    return repository.update({id: translationTextId}, {translatedText: translatedText})
  }

}
