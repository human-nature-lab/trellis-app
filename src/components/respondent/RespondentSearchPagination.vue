<script setup lang="ts">
import { computed } from 'vue'
import { RandomPagination } from '@/types/Pagination'

const props = withDefaults(defineProps<{
  pagination: RandomPagination
  loading?: boolean
  currentPageCount: number
  showTotal?: boolean
}>(), {
  loading: false,
  showTotal: true,
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const length = computed(() => {
  const maxPages = (props.pagination as RandomPagination & { maxPages?: number }).maxPages ?? 0
  return maxPages + 2
})

const value = computed(() => props.pagination.page + 1)

// Disable paging forward past the last incomplete page (matches the original
// view's behavior where you can't advance past a partially-filled first page).
const disabled = computed(() => {
  return props.loading || (props.pagination.page === 0 && props.currentPageCount !== props.pagination.size)
})

function onInput (page: number) {
  emit('update:page', page)
}
</script>

<template>
  <div class="respondent-search-pagination">
    <v-row class="no-gutters justify-space-between px-0 py-4">
      <v-col
        cols="auto"
        class="px-0"
      >
        <v-pagination
          :length="length"
          :value="value"
          total-visible="7"
          :disabled="disabled"
          @input="onInput"
        />
      </v-col>
      <v-col cols="auto">
        <slot name="actions" />
      </v-col>
    </v-row>
    <v-row
      v-if="showTotal && pagination.total > 0"
      class="no-gutters justify-space-between px-0 py-4"
    >
      <v-col
        cols="auto"
        class="px-0"
      >
        {{ $t('total_respondents', { n: pagination.total }) }}
      </v-col>
    </v-row>
  </div>
</template>
