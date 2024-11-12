<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration, intervalToDuration } from 'date-fns'
import { locale } from '@/services/DateService'

const props = defineProps<{
  start: number | Date
  end?: number | Date
}>()

const duration = computed(() => {
  if (!props.start) {
    return ''
  }
  const d = intervalToDuration({ start: props.start, end: props.end || new Date() })
  return formatDuration(d, { locale, delimiter: ', ' })
})
</script>

<template>
  <span>{{ duration }}</span>
</template>
