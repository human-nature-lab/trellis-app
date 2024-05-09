<script setup lang="ts">
import { locale } from '@/services/DateService'
import { computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps<{
  date: Date
  format?: string
}>()

const formatted = computed(() => {
  const date = props.date
  if (!date) {
    return ''
  }
  const dateFormat = props.format || 'Pp'
  return format(date, dateFormat, { locale })
})
</script>

<template>
  <span>{{ formatted }}</span>
</template>
