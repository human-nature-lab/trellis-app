import http from '../http/AxiosInstance'
import TranslationTextServiceInterface from './TranslationTextServiceInterface'
import TranslationText from "../../entities/trellis/TranslationText";

export default class TranslationTextServiceWeb implements TranslationTextServiceInterface {

  async updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any> {
    return http().post(`translation-text/${encodeURIComponent(translationTextId)}`, {
      translated_text: translatedText
    })
  }

  async getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]> {
    throw new Error("getTranslatedTextByTranslationId has not been implemented in the web yet")
  }

}
