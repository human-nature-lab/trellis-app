<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import config from '@/config'
import device from '@/services/device'
import { Server } from '../../services/nearby-communications/server'
import { useRoute } from 'vue-router/composables'

const route = useRoute()
const { studyId, formId } = route.params
const deviceName = ref('')
let server: Server
const working = ref(false)
const devices = ref([])
const connections = ref([])
const endpoints = ref([])

const serviceId = computed(() => {
  return `${config.apiRoot}_${studyId}_${formId}`
})

function onPayloadReceived (...args: any[]) {
  console.log('payload received', args)
}

async function start () {
  console.log('starting server')
  working.value = true
  try {
    deviceName.value = await device.getDeviceKey()
    server = new Server(deviceName.value, serviceId)
    server.messages.add(onPayloadReceived)
    await server.start()
  } catch (err) {
    console.error(err)
  } finally {
    working.value = false
  }
}
async function stop () {
  working.value = true
  try {
    server.messages.remove(onPayloadReceived)
    if (server) {
      await server.stop()
    }
  } catch (err) {
    console.error(err)
  } finally {
    working.value = false
  }
}

onBeforeUnmount(async () => {
  await stop()
})

start()

</script>

<template>
  <v-container>
    <h1>Server</h1>
    <div>
      {{ deviceName }}
    </div>
    <div>{{ serviceId }}</div>
    <h3>Status: {{ server && server.state }}</h3>
    <v-row class="no-gutters">
      <v-btn
        @click="start"
        :loading="working"
      >
        Start
      </v-btn>
      <v-btn
        @click="stop"
        :loading="working"
      >
        Stop
      </v-btn>
    </v-row>
    <h3 v-if="server">
      Connections {{ Object.keys(server.connections).length }} ({{ Object.keys(server.pending).length }})
    </h3>
    <v-list v-if="server">
      <v-list-item
        v-for="connection in server.pending"
        :key="connection.endpointId"
      >
        Pending {{ connection }}
      </v-list-item>
    </v-list>
    <v-list v-if="server">
      <v-list-item
        v-for="connection in server.connections"
        :key="connection.endpointId"
      >
        {{ connection }}
      </v-list-item>
    </v-list>
    <h3>Devices</h3>
    <v-list>
      <v-list-item
        v-for="device in devices"
        :key="device.id"
      >
        {{ device }}
      </v-list-item>
    </v-list>
    <h3>Endpoints</h3>
    <v-list>
      <v-list-item
        v-for="endpoint in endpoints"
        :key="endpoint"
      >
        {{ endpoint }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style lang="sass">

</style>
