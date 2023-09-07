<script setup lang="ts" >
import { ref, onBeforeUnmount, computed } from 'vue'
import config from '@/config'
import { useRoute } from 'vue-router/composables'
import NearbyCommunications, { Connection } from '@/services/nearby-communications'

const route = useRoute()
const { studyId, formId } = route.params
const status = ref('disconnected')
const messages = ref<string[]>([])

const serviceId = computed(() => {
  return `${config.apiRoot}_${studyId}_${formId}`
})

async function connect () {
  status.value = 'starting'
  try {
    await NearbyCommunications.startDiscovery('star', serviceId.value)
    status.value = 'discovering'
  } catch (err) {
    status.value = 'error'
    console.error(err)
  }
}
async function onConnection (connection: Connection) {
  status.value = 'connected'
  console.log('Connected to', connection)
}
async function onConnectionFound (connection: Connection) {
  // TODO: validate the server somehow
  await NearbyCommunications.acceptConnection(connection.endpointId)
}
async function disconnect () {
  status.value = 'disconnecting'
  try {
    await NearbyCommunications.stopDiscovery()
    status.value = 'disconnected'
  } catch (err) {
    status.value = 'error'
    console.error(err)
  }
}
function onPayloadReceived (msg: string) {
  messages.value.push(msg)
}

NearbyCommunications.hooks.onConnection.add(onConnection)
NearbyCommunications.hooks.onConnectionFound.add(onConnectionFound)
NearbyCommunications.hooks.onPayloadReceived.add(onPayloadReceived)
connect()

onBeforeUnmount(() => {
  NearbyCommunications.hooks.onConnection.remove(onConnection)
  NearbyCommunications.hooks.onConnectionFound.remove(onConnectionFound)
  NearbyCommunications.hooks.onPayloadReceived.remove(onPayloadReceived)
})

</script>

<template>
  <v-container>
    <h1>Client</h1>
    <h2>Status: {{ status }}</h2>
    <v-col>
      <v-btn
        @click="connect"
        :disabled="(status === 'connecting' || status === 'connected' || status === 'discovering')"
        :loading="status === 'connecting'"
      >
        {{ $t('connect') }}
      </v-btn>
      <v-btn
        :disabled="!(status === 'discovering' || status === 'connected')"
        @click="disconnect"
        :loading="status === 'disconnecting'"
      >
        {{ $t('disconnect') }}
      </v-btn>
    </v-col>
    <v-list>
      <v-list-item v-for="msg in messages">
        {{ msg }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style lang="sass">

</style>
