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
        <LoginForm
          v-model="isLoginValid"
          :showLoginButton="false"
          @username="username = $event"
          @password="password = $event" />
        <v-text-field
          v-model="deviceName"
          :rules="deviceNameRules"
          :label="$t('device_name')" />
        <v-btn
          :disabled="!isValid || isWorking"
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
  import LoginForm from '../components/LoginForm.vue'
  import TrellisLoadingCircle from '../components/TrellisLoadingCircle.vue'
  import Device from "../entities/trellis/Device"
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import DeviceService from "../services/device/DeviceService"
  import {replaceWithNext} from '../router'

  export default Vue.extend({
    name: 'RegisterDevice',
    mixins: [DocsLinkMixin('./devices/RegisterDevice.md')],
    components: { LoginForm, TrellisLoadingCircle },
    data () {
      return {
        isWorking: false,
        isLoginValid: false,
        username: '',
        password: '',
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
          const storedDevice = await DeviceService.createDevice(device, this.username, this.password)
          await DeviceService.setDeviceKey(storedDevice)
          replaceWithNext()
        } catch (err) {
          if (err && err.response && err.response.status === 401) {
            this.alert('error', 'Cannot register device with this username and password')
          } else {
            this.log(err)
            this.alert('error', err.message, {timeout: 0})
          }
        } finally {
          this.isWorking = false
        }
      }
    },
    computed: {
      isValid (): boolean {
        return this.isLoginValid && !!this.deviceName.length
      }
    }
  })
</script>

<style scoped>

</style>
