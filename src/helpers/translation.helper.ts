import Translation from '@/entities/trellis/Translation'
import TranslationTextService from '@/services/translation-text/'
import TranslationTextInterface from '@/services/translation-text/TranslationTextServiceInterface'
import { ref } from 'vue'

const ttService: TranslationTextInterface = TranslationTextService
export function useTranslation (translationId?: string) {
  const translation = ref<Translation>()
  const loading = ref(false)
  const error = ref()

  let prevTranslation: Translation

  async function reload () {
    try {
      loading.value = true
      translation.value = await ttService.getTranslationById(translationId)
      prevTranslation = translation.value.copy()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function save () {
    try {
      loading.value = true
      // TODO: figure out which translationText changed and update that one
      // await ttService.updateTranslation(translation.value)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  if (translationId) {
    reload()
  }
  return { translation, loading, error, reload, save }
}
