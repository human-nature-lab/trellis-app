<template>
  <v-container>
    <h1>Server</h1>
    <div>
      {{ deviceName }}
    </div>
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
    <h3 v-if="server">Connections {{ Object.keys(server.connections).length }} ({{ Object.keys(server.pending).length }})</h3>
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

<script lang="ts">
import Vue from 'vue'
import device from '@/services/device'
import { Server } from '../../services/nearby-communications/server'

export default Vue.extend({
  name: 'NearbyServer',
  data () {
    return {
      server: null as Server | null,
      serviceId: 'trellis',
      working: false,
      deviceName: '',
      devices: [],
      connections: [],
      endpoints: [],
    }
  },
  async created () {
    this.deviceName = await device.getDeviceKey()
    await this.start()
  },
  async beforeDestroy () {
    await this.stop()
  },
  methods: {
    async start () {
      console.log('starting server')
      this.working = true
      try {
        this.server = new Server(this.deviceName, this.serviceId)
        this.server.messages.add(this.onPayloadReceived)
        await this.server.start()
      } catch (err) {
        console.error(err)
      } finally {
        this.working = false
      }
    },
    async stop () {
      this.working = true
      try {
        this.server.messages.remove(this.onPayloadReceived)
        await this.server.stop()
      } catch (err) {
        console.error(err)
      } finally {
        this.working = false
      }
    },
    onPayloadReceived (...args: any[]) {
      console.log('payload received', args)
    },
  },
})
</script>

<style lang="sass">

</style>
