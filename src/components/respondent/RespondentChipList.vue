<script setup lang="ts">
import { computed } from 'vue'
import Respondent from '@/entities/trellis/Respondent'

const props = defineProps<{
  value: Respondent[]
  maxVisible?: number
}>()

const emit = defineEmits<{
  (event: 'remove', value: Respondent): void
}>()

function getRespondentName (respondent) {
  const rName = respondent.names.find(n => n.isDisplayName)
  return rName ? rName.name : respondent.name
}

const list = computed(() => {
  return props.value.slice().sort((a, b) => getRespondentName(a).localeCompare(getRespondentName(b)))
})
</script>

<template>
  <v-row
    class="no-gutters flex-nowrap pb-4"
  >
    <v-chip
      v-for="r in list"
      :key="r.id"
      class="ma-1 flex-shrink-0"
      @click:close="emit('remove', r)"
      close
    >
      {{ getRespondentName(r) }}
    </v-chip>

    <!-- <v-chip
      v-if="exceedsMax && !isExpanded"
      class="ma-1"
    >
      +{{ props.value.length - props.maxVisible }}
    </v-chip> -->
  </v-row>
</template>

<style lang="sass" scoped>
.row
  overflow-x: auto
</style>
