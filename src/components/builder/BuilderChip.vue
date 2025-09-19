<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  visible?: boolean
  disabled?: boolean
  locked?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', $event: MouseEvent): void
}>()

const clickable = computed(() => !props.disabled && !props.locked)

function onClick ($event) {
  if (!clickable.value) return
  emit('click', $event)
}
</script>

<template>
  <v-slide-x-transition>
    <v-chip
      v-if="visible"
      v-bind="$attrs"
      :disabled="disabled"
      v-on="{...$listeners, click: clickable ? onClick : undefined}"
      class="ml-2"
    >
      <slot />
    </v-chip>
  </v-slide-x-transition>
</template>
