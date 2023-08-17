<template>
  <v-container>
    <v-row>
      <div>
        {{ deviceName }}
      </div>
      <v-btn
        @click="startAdvertising"
        :loading="working"
      >
        Start advertising
      </v-btn>
      <v-btn
        @click="startDiscovery"
        :loading="working"
      >
        Start discovery
      </v-btn>
    </v-row>
    <v-list>
      <v-list-item v-for="device in devices" :key="device.id">
        {{ device }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import NearbyCommunications from '@/services/nearby-communications'
import device from '@/services/device'

export default Vue.extend({
  name: 'NearbyCommunications',
  data () {
    return {
      working: false,
      deviceName: '',
      devices: [],
    }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.working = true
      try {
        this.deviceName = await device.getDeviceKey()
      } catch (e) {
        console.error(e)
      } finally {
        this.working = false
      }
    },
    async startAdvertising () {
      this.working = true
      try {
        NearbyCommunications.onConnectionFound(this.foundConnection, console.error)
        await NearbyCommunications.startAdvertising(this.deviceName, 'star', 'trellis')
      } catch (e) {
        console.error(e)
      } finally {
        this.working = false
      }
    },
    async startDiscovery () {
      this.working = true
      try {
        NearbyCommunications.onEndpointFound(this.foundEndpoint, console.error)
        await NearbyCommunications.startDiscovery('star', 'trellis')
      } catch (e) {
        console.error(e)
      } finally {
        this.working = false
      }
    },
    async foundConnection (...args: any[]) {
      console.log('foundConnection', args)
    },
    async foundEndpoint (...args: any[]) {
      console.log('foundEndpoint', args)
    },
  },
})
</script>

<style lang="sass">

</style>
