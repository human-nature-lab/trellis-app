<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  value: string
  options: {
    icon: string
    ariaLabel?: string
    title?: string
    value: string
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
}>()

const selectedIndex = ref(props.options.findIndex(option => option.value === props.value))

function toggle() {
  selectedIndex.value = (selectedIndex.value + 1) % props.options.length
  emit('input', props.options[selectedIndex.value].value)
  emit('update:modelValue', props.options[selectedIndex.value].value)
}
</script>

<template>
  <v-btn
    v-bind="$attrs"
    :aria-label="props.options[selectedIndex].ariaLabel"
    :title="props.options[selectedIndex].title"
    @click="toggle"
  >
    <v-icon>{{ props.options[selectedIndex].icon }}</v-icon>
  </v-btn>
</template>
