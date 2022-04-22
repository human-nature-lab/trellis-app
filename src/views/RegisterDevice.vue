<template>
  <v-flex>
    <v-layout justify-space-around>
      <v-flex xs6 class="text-xs-center">
        <h2>
          {{ $t('register_device') }}
        </h2>
      </v-flex>
    </v-layout>
    <v-layout justify-space-around>
      <v-flex xs8>
        <v-text-field
          v-model="deviceName"
          :rules="deviceNameRules"
          :label="$t('device_name')" />
        <v-btn
          :disabled="isWorking"
          @click="register">
          <TrellisLoadingCircle v-if="isWorking" size="30px" />
          <span v-else>{{$t('register_device')}}</span>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisLoadingCircle from '../components/TrellisLoadingCircle.vue'
  import Device from '../entities/trellis/Device'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import DeviceService from '../services/device'
  import { routeQueue } from '../router'

  export default Vue.extend({
    name: 'RegisterDevice',
    mixins: [DocsLinkMixin('./devices/RegisterDevice.md')],
    components: { TrellisLoadingCircle },
    data () {
      return {
        isWorking: false,
        deviceName: device && device.model,
        deviceNameRules: [v => !!v && !!v.length || this.$t('required_field')]
      }
    },
    methods: {
      async register () {
        try {
          this.isWorking = true
          const device = new Device()
          device.deviceId = await DeviceService.getUUID()
          device.name = this.deviceName
          const storedDevice = await DeviceService.createDevice(device)
          await DeviceService.setDeviceKey(storedDevice)
          routeQueue.goToNext()
        } catch (err) {
          if (err && err.response && err.response.status === 401) {
            this.alert('error', 'Cannot register device with this username and password')
          } else {
            this.logError(err)
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
