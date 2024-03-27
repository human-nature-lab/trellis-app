<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Mutex } from 'async-mutex'
import Locale from '@/entities/trellis/Locale'
import Translation from '@/entities/trellis/Translation'
import TranslationService from '@/services/TranslationService'
import TranslationTextService from '@/services/translation-text'
import { logError } from '@/helpers/log.helper'

const props = defineProps<{
  translation?: Translation
  translationId?: string
  locale: Locale
  tag?: string
}>()

const translation = ref<Translation>(props.translation)
const loading = ref(false)
const component = computed(() => props.tag || 'span')

const mut = new Mutex()
watch(() => [props.translation, props.translationId, props.locale], async () => {
  const sameAsExisting = !!translation.value &&
    (!!props.translationId && props.translationId === translation.value.id) ||
    (!!props.translation && props.translation.id === translation.value.id)
  if (sameAsExisting || loading.value) {
    return
  }
  if (props.translation) {
    translation.value = props.translation
  } else if (props.translationId) {
    return mut.runExclusive(async () => {
      loading.value = true
      try {
        translation.value = await TranslationTextService.getTranslationById(props.translationId)
      } catch (err) {
        logError(err)
      } finally {
        loading.value = false
      }
    })
  } else {
    logError(new Error('No translation or translationId provided'))
  }
}, { immediate: true })

const translated = computed(() => translation.value
  ? TranslationService.getTranslated(translation.value as Translation, props.locale)
  : '...')
</script>

<template>
  <component
    :is="component"
    v-bind="$attrs"
  >
    {{ translated }}
  </component>
</template>

<style lang="sass">

</style>
