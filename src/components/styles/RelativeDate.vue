<script setup lang="ts">
import { locale } from '@/services/DateService'
import { formatRelative } from 'date-fns'
import { computed } from 'vue'

const props = defineProps<{
  date: number | Date
  relativeTo?: number | Date
}>()

const formatted = computed(() => {
  const date = props.date
  if (!date) {
    return ''
  }
  return formatRelative(date, props.relativeTo || new Date(), { locale })
})
</script>

<template>
  <span>{{ formatted }}</span>
</template>

<style lang="sass">

</style>
