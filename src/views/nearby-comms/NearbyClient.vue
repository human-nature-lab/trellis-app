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

<script lang="ts">
import NearbyCommunications, { Connection } from '../../services/nearby-communications'
import Vue from 'vue'

export default Vue.extend({
  name: 'NearbyClient',
  data () {
    return {
      serviceId: 'trellis',
      status: 'disconnected',
      messages: [] as string[],
    }
  },
  created () {
    NearbyCommunications.hooks.onConnection.add(this.onConnection)
    NearbyCommunications.hooks.onConnectionFound.add(this.onConnectionFound)
    NearbyCommunications.hooks.onPayloadReceived.add(this.onPayloadReceived)
    this.connect()
  },
  async beforeDestroy () {
    NearbyCommunications.hooks.onConnection.remove(this.onConnection)
    NearbyCommunications.hooks.onConnectionFound.remove(this.onConnectionFound)
    NearbyCommunications.hooks.onPayloadReceived.remove(this.onPayloadReceived)
    await this.disconnect()
  },
  methods: {
    async connect () {
      this.status = 'starting'
      try {
        await NearbyCommunications.startDiscovery('star', this.serviceId)
        this.status = 'discovering'
      } catch (err) {
        this.status = 'error'
        console.error(err)
      }
    },
    async onConnection (connection: Connection) {
      this.status = 'connected'
      console.log('Connected to', connection)
    },
    async onConnectionFound (connection: Connection) {
      // TODO: validate the server somehow
      await NearbyCommunications.acceptConnection(connection.endpointId)
    },
    async disconnect () {
      this.status = 'disconnecting'
      try {
        await NearbyCommunications.stopDiscovery()
        this.status = 'disconnected'
      } catch (err) {
        this.status = 'error'
        console.error(err)
      }
    },
    onPayloadReceived (msg: string) {
      this.messages.push(msg)
    },
  },
})
</script>

<style lang="sass">

</style>
