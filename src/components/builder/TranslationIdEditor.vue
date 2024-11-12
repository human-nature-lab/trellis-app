<script setup lang="ts">
import { useTranslation } from '@/helpers/translation.helper'
import Translation from '@/components/builder/Translation.vue'
import TranslationModel from '@/entities/trellis/Translation'
import Locale from '@/entities/trellis/Locale'

const props = defineProps<{
  value?: string
  locale: Locale
  loading?: boolean
}>()

const emit = defineEmits<{
  (event: 'input', translationId: string): void
}>()

const { translation, loading, error, onCreated } = useTranslation(props.value, true)

onCreated(t => {
  emit('input', t.id)
})

function updateTranslation (newTranslation: TranslationModel) {
  if (newTranslation.id !== translation.value.id) {
    emit('input', newTranslation.id)
  }
  translation.value = newTranslation
}

</script>

<template>
  <v-col class="ma-0 pa-0">
    <v-alert
      v-if="error"
      color="error"
    >
      {{ error }}
    </v-alert>
    <Translation
      v-if="translation"
      :value="translation"
      @input="updateTranslation"
      :loading="props.loading || loading"
      :locale="props.locale"
      v-bind="$attrs"
    />
  </v-col>
</template>
