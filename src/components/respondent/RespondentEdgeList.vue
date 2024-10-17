<script setup lang="ts">
import Edge from '@/entities/trellis/Edge'
import Respondent from '@/entities/trellis/Respondent'
import RespondentAvatar from '@/components/photo/RespondentAvatar.vue'
import { computed } from 'vue'

const props = defineProps<{
  value: Edge[]
  currentRespondentId?: string
  editable?: boolean
  disabled?: boolean
  chips?: boolean
  tag?: string
  showSource?: boolean
}>()

const emit = defineEmits<{
  (event: 'remove', edge: Edge): void
}>()

function getRespondentName (r: Respondent): string {
  const name = r.names?.find(n => n.isDisplayName)
  return name ? name.name : r.name
}

const showSourceRespondent = computed(() =>
  props.showSource || props.value.some(e => e.sourceRespondentId !== props.currentRespondentId),
)

</script>

<template>
  <component
    :is="props.tag || 'v-col'"
    class="pa-0"
  >
    <v-row
      v-if="props.chips"
      class="no-gutters"
    >
      <v-chip
        v-for="edge in props.value"
        :key="edge.id"
        :close="props.editable"
        :disabled="props.disabled"
        @click:close="emit('remove', edge)"
      >
        <RespondentAvatar
          :respondent="edge.targetRespondent"
          class="mr-2"
        />
        {{ getRespondentName(edge.targetRespondent) }}
      </v-chip>
    </v-row>
    <v-list v-else>
      <v-list-item
        v-for="edge in props.value"
        :key="edge.id"
      >
        <v-list-item-avatar v-if="showSourceRespondent">
          <RespondentAvatar :respondent="edge.sourceRespondent" />
        </v-list-item-avatar>
        <v-list-item-content v-if="showSourceRespondent">
          {{ getRespondentName(edge.sourceRespondent) }}
        </v-list-item-content>
        <v-list-item-action
          v-if="showSourceRespondent"
          class="mx-4"
        >
          <v-icon>mdi-arrow-right</v-icon>
        </v-list-item-action>
        <v-list-item-avatar class="mr-4">
          <RespondentAvatar :respondent="edge.targetRespondent" />
        </v-list-item-avatar>
        <v-list-item-content>
          {{ getRespondentName(edge.targetRespondent) }}
        </v-list-item-content>
        <v-list-item-action v-if="props.editable">
          <v-btn
            icon
            :disabled="props.disabled"
            @click="emit('remove', edge)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </component>
</template>
