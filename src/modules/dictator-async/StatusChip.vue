<script setup lang="ts">
import { computed } from 'vue'

type Status = 'started' | 'starting' | 'connected' | 'connecting' |
'disconnected' | 'disconnecting' | 'stopping' | 'error' | 'running' |
'stopped' | 'finished' | 'discovering' | 'failure'

const props = defineProps<{
  status: Status
}>()

const color = computed(() => {
  if (props.status === 'connected' || props.status === 'running' || props.status === 'started') {
    return 'success'
  } else if (props.status === 'connecting' || props.status === 'disconnecting' ||
    props.status === 'stopping' || props.status === 'starting' || props.status === 'discovering') {
    return 'warning'
  } else {
    return 'error'
  }
})
</script>

<template>
  <v-chip :color="color">
    {{ status }}
  </v-chip>
</template>

<style lang="sass">

</style>
