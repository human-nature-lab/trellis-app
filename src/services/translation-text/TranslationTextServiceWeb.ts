import http from '../http/AxiosInstance'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'

export default class TranslationTextServiceWeb implements TranslationTextServiceInterface {

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any> {
    return http().post(`translation-text/${encodeURIComponent(translationTextId)}`, {
      translated_text: translatedText
    })
  }

}
