import http from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import TranslationText from '../../entities/trellis/TranslationText'

class TranslationTextServiceWeb implements TranslationTextServiceInterface {

  async createTranslationText (translationId: string, translationText: TranslationText): Promise<TranslationText> {
    const res = await http().post(uriTemplate('translation/{id}/translation-text', [translationId]), translationText.toSnakeJSON())
    return new TranslationText().fromSnakeJSON(res.data.translation_text)
  }

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<TranslationText> {
    const res = await http().put(uriTemplate('translation-text/{id}', [translationTextId]), {
      translated_text: translatedText
    })
    return new TranslationText().fromSnakeJSON(res.data.translation_text)
  }

  async getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]> {
    const res = await http().get(uriTemplate('translation/{id}/translation-text', [translationId]))
    let translationText = []
    for (let i = 0; i < res.data.translation_text.length; i++) {
      translationText.push(new TranslationText().fromSnakeJSON(res.data.translation_text[i]))
    }
    return translationText
  }

}

export default new TranslationTextServiceWeb()