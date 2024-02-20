import http from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import TranslationText from '../../entities/trellis/TranslationText'
import Translation from '@/entities/trellis/Translation'

class TranslationTextServiceWeb implements TranslationTextServiceInterface {
  async createTranslationText (translationId: string, translationText: TranslationText): Promise<TranslationText> {
    const res = await http().post(uriTemplate('translation/{id}/translation-text', [translationId]), translationText.toSnakeJSON())
    return new TranslationText().fromSnakeJSON(res.data.translation_text)
  }

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<TranslationText> {
    const res = await http().put(uriTemplate('translation-text/{id}', [translationTextId]), {
      translated_text: translatedText,
    })
    return new TranslationText().fromSnakeJSON(res.data.translation_text)
  }

  async getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]> {
    const res = await http().get(uriTemplate('translation/{id}/translation-text', [translationId]))
    const translationText = []
    for (let i = 0; i < res.data.translation_text.length; i++) {
      translationText.push(new TranslationText().fromSnakeJSON(res.data.translation_text[i]))
    }
    return translationText
  }

  async getTranslationById (translationId: string): Promise<Translation> {
    const res = await http().get(uriTemplate('translation/{id}', [translationId]))
    return new Translation().fromSnakeJSON(res.data.translation)
  }

  async getTranslationsById (translationIds: string[]): Promise<Translation[]> {
    const res = await http().get(uriTemplate('translations', []), { params: { id: translationIds } })
    return res.data.translations.map(t => new Translation().fromSnakeJSON(t))
  }
}

export default new TranslationTextServiceWeb()
