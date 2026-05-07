<!-- a functional component that displays a respondent name in the current locale -->
 <!-- optionally, include a button to copy the respondent id to the clipboard next to the name -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRespondent } from '@/helpers/respondent.helper'
import { locale } from '@/helpers/singleton.helper'
import Respondent from '@/entities/trellis/Respondent'

const props = defineProps<{
  showLink?: boolean
  respondentId?: string
  respondent?: Respondent
}>()

const { respondent: loadedRespondent, loading, error } = useRespondent(() => props.respondentId)
const respondent = computed(() => {
  if (props.respondent) return props.respondent
  return loadedRespondent.value
})
const name = computed(() => {
  if (loading.value) return 'Loading...'
  if (!respondent.value) return ''
  if (!respondent.value?.respondentNames) return respondent.value.name
  for (const n of respondent.value.respondentNames) {
    if (n.localeId === locale.value) return n.name
  }
  return 'Unknown name'
})

</script>

<template>
  <span>
    {{ name }}
    <span v-if="showLink && respondent">
      <v-btn
        icon
        small
        :to="{ name: 'Respondent', params: { respondentId: respondent.id } }"
        target="_blank"
      >
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </span>
  </span>
</template>
