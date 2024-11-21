<script setup lang="ts">
import { computed, useAttrs, useListeners } from 'vue'
import { alert } from '@/helpers/log.helper'
const props = defineProps<{
  alertMsg: string | { toString(): string },
  disabled: boolean,
}>()

const $attrs = useAttrs()

const attrs = computed(() => {
  if (props.disabled) {
    const { to, ...rest } = $attrs
    return {
      ...rest,
    }
  }
  return $attrs
})

const $listeners = useListeners()
const listeners = computed(() => {
  if (props.disabled) {
    return {
      ...$listeners,
      click: () => {
        alert('error', props.alertMsg.toString())
      },
    }
  }
  return $listeners
})
</script>

<template>
  <v-list-item
    v-bind="attrs"
    v-on="listeners"
  >
    <slot />
  </v-list-item>
</template>
