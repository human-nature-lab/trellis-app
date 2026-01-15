<script setup lang="ts">
import { ref } from 'vue'
import TrellisModal from './TrellisModal.vue'

const props = defineProps<{
  title?: string
  value: string
  label?: string
}>()

const isOpen = ref(false)
const editingValue = ref(props.value)

const emit = defineEmits<{
  (e: 'save', value: string): void
  (e: 'cancel'): void
}>()

const save = () => {
  emit('save', props.value)
}

</script>

<template>
  <TrellisModal
    :title="title"
    v-model="isOpen"
    @close="emit('cancel')"
  >
    <v-textarea v-model="editingValue" />
    <template #footer>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="save"
        >
          Save
        </v-btn>
        <v-btn
          color="secondary"
          @click="emit('cancel')"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </template>
  </TrellisModal>
</template>
