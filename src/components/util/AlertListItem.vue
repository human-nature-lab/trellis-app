<script setup lang="ts">
import { computed, useAttrs, useListeners } from 'vue'
import { alert } from '@/helpers/log.helper'
import { TrellisPermission } from '@/static/permissions'
import { userHasPermission } from '@/helpers/user.helper'

const props = defineProps<{
  requires?: TrellisPermission,
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

const hasPermission = userHasPermission(props.requires)

const showAlert = computed(() => {
  return !props.requires || hasPermission.value
})
</script>

<template>
  <v-list-item
    v-if="showAlert"
    v-bind="attrs"
    v-on="listeners"
  >
    <slot />
  </v-list-item>
</template>
