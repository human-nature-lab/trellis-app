<script setup lang="ts">
import { ref } from 'vue'
import { HistoryItem } from '@/router/history'
import { i18n } from '@/i18n'
import TranslationService from '@/services/TranslationService'
import TranslationTextService from '@/services/translation-text'

const props = defineProps<{ route: HistoryItem }>()
const loading = ref(false)
const title = ref('Loading')
if (!props.route) {
  throw new Error('must provide route prop')
}

async function loadTranslation () {
  loading.value = true
  try {
    const translation = await TranslationTextService.getTranslationById(props.route.title.translationId)
    title.value = TranslationService.getAny(translation) as string
  } finally {
    loading.value = false
  }
}

if (typeof props.route.title === 'string') {
  title.value = props.route.title
} else if ('key' in props.route.title) {
  const args = props.route.title.args || []
  title.value = i18n.t(props.route.title.key, args) as string
} else if (props.route.title.translationId) {
  loadTranslation()
}

</script>

<template>
  <span>{{ title }}
    <span v-if="route.route.name">({{ route.route.name }})</span>
    <!-- <span class="mx-3">{{ new Date(route.timestamp).toLocaleTimeString() }}</span> -->
  </span>
</template>

<style lang="sass">

</style>
