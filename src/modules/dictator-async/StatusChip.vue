<script setup lang="ts">
import { i18n } from '@/i18n'
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

const statusMap = {
  connected: i18n.t('connected'),
  running: i18n.t('running'),
  started: i18n.t('started'),
  connecting: i18n.t('connecting'),
  disconnected: i18n.t('disconnected'),
  disconnecting: i18n.t('disconnecting'),
  stopping: i18n.t('stopping'),
  starting: i18n.t('starting'),
  discovering: i18n.t('discovering'),
  finished: i18n.t('finished'),
  stopped: i18n.t('stopped'),
  error: i18n.t('error'),
  failure: i18n.t('failure'),
}

const translated = computed(() => {
  return statusMap[props.status]
})
</script>

<template>
  <v-chip :color="color">
    {{ translated }}
  </v-chip>
</template>

<style lang="sass">

</style>
