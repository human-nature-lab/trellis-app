<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration, intervalToDuration } from 'date-fns'
import { locale } from '@/services/DateService'
import { simplifyDuration } from '@/lib/date/simplify-duration'

const props = defineProps<{
  start: number | Date
  end?: number | Date
}>()

const fullDuration = computed(() => {
  if (!props.start) {
    return {} as Duration
  }
  return intervalToDuration({ start: props.start, end: props.end || new Date() })
})

const duration = computed(() => {
  return formatDuration(simplifyDuration(fullDuration.value), { locale, delimiter: ', ' })
})

const titleDuration = computed(() => {
  return formatDuration(fullDuration.value, { locale })
})
</script>

<template>
  <span :title="titleDuration">{{ duration }}</span>
</template>
