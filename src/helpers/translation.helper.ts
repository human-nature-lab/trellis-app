import { WatchSource, ref, watch } from 'vue'
import Translation from '@/entities/trellis/Translation'
import builder from '@/services/builder'
import TranslationTextService from '@/services/translation-text/'
import TranslationTextInterface from '@/services/translation-text/TranslationTextServiceInterface'
import { logError } from './log.helper'

const ttService: TranslationTextInterface = TranslationTextService

// Load and use a single translation
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

// Get the translated text for a translation
export function translate (translation: Translation, localeId: string) {
  if (translation == null) {
    return null
  }
  if (translation.translationText == null) {
    return null
  }
  const tt = translation.translationText.find(tt => tt.localeId === localeId)
  if (!tt) {
    return null
  }
  return tt.translatedText
}

export function useTranslations (ids: WatchSource<string[]>) {
  const translations = ref<Translation[]>([])
  const loading = ref(false)
  const error = ref<Error>(null)

  async function reload (ids: string[]) {
    if (!ids || !ids.length) return
    try {
      error.value = null
      loading.value = true
      translations.value = await ttService.getTranslationsById(ids)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  watch(ids, reload, { immediate: true })

  return { translations, loading, error, reload }
}
