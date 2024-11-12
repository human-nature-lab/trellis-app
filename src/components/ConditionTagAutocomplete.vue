<script setup lang="ts">
import { ref, watch } from 'vue'
import ConditionTagService from '../services/condition-tag'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'
import { stringToColor } from '@/lib/string-to-color'

const props = defineProps<{
  value: string[];
}>()

const isLoading = ref(false)
const conditionTags = ref<string[]>([])
const hasLoaded = ref(false)
const query = ref<string | null>(null)

watch(() => [props.value, query.value], async () => {
  if (conditionTags.value.length || isLoading.value || hasLoaded.value) return
  isLoading.value = true
  try {
    const tags = await ConditionTagService.respondent()
    tags.sort((a, b) => a.name.localeCompare(b.name))
    conditionTags.value = tags.map((c) => c.name)
    hasLoaded.value = true
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

</script>

<template>
  <v-autocomplete
    v-on="$listeners"
    :items="conditionTags"
    :value="value"
    :label="$t('condition_tags')"
    multiple
    dense
    chips
    tags
    clearable
    :hide-no-data="!hasLoaded"
    :search-input.sync="query"
    :loading="isLoading"
    @input="$emit('input', $event)"
    v-bind="$attrs"
  >
    <template #selection="props">
      <v-chip
        outlined
        :color="stringToColor(props.item)"
      >
        <v-icon
          small
          class="mr-2"
        >
          mdi-tag
        </v-icon>
        {{ props.item }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>
