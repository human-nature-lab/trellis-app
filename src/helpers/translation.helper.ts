import { ref } from 'vue'
import Translation from '@/entities/trellis/Translation'
import builder from '@/services/builder'
import TranslationTextService from '@/services/translation-text/'
import TranslationTextInterface from '@/services/translation-text/TranslationTextServiceInterface'
import { logError } from './log.helper'

const ttService: TranslationTextInterface = TranslationTextService
export function useTranslation (translationId?: string, shouldCreate = false) {
  const translation = ref<Translation>()
  const loading = ref(false)
  const error = ref()

  async function reload () {
    try {
      error.value = null
      loading.value = true
      translation.value = await ttService.getTranslationById(translationId)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  let notifycreated: (translation: Translation) => void
  async function create () {
    try {
      loading.value = true
      error.value = null
      translation.value = await builder.createTranslation()
      if (notifycreated) {
        notifycreated(translation.value)
      }
    } catch (err) {
      logError(err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  if (translationId) {
    reload()
  } else if (shouldCreate) {
    create()
  }

  function onCreated (cb: (translation: Translation) => void) {
    notifycreated = cb
  }

  return { translation, loading, error, reload, onCreated }
}
