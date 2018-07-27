<template>
  <div>
    <ul>
      <li>
        Authenticating device...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
        <strong v-if="warning" class="amber--text">WARNING.</strong>
      </li>
    </ul>
    <trellis-alert type="warning" :show="warning" :message="warningMessage"></trellis-alert>
    <trellis-alert type="error" :show="error" :message="errorMessage"></trellis-alert>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="!success && !checking"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="checking"
      flat
      @click.native="stopChecking">Stop</v-btn>
  </div>
</template>

<script>
    import axios from 'axios'
    import config from '@/config'
    import SyncService from '../../services/SyncService'
    import DeviceService from '@/services/device/DeviceService'
    import TrellisAlert from '../../../TrellisAlert.vue'
    export default {
      name: 'authenticate-device',
      data () {
        return {
          success: false,
          error: false,
          warning: false,
          checking: true,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: '',
          warningMessage: ''
        }
      },
      created () {
        this.authenticate()
      },
      props: {
      },
      methods: {
        authenticate: function () {
          DeviceService.getUUID().then((deviceId) => {
            console.log('deviceId', deviceId)
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            this.checking = true
            SyncService.authenticate(this.source, deviceId).then(() => {
              this.success = true
              this.checking = false
              this.$emit('authentication-ok')
            }).catch((err) => {
              this.checking = false
              if (err.response && err.response.status === 401) {
                // Expected result if the device hasn't been added to the server
                this.warning = true
                this.warningMessage = 'The device was not found on the server, please see an administrator for a resolution.'
              } else {
                this.error = true
                this.errorMessage = err
              }
            })
          })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.checking = false
        },
        retry: function () {
          this.error = false
          this.errorMessage = ''
          this.warning = false
          this.warningMessage = ''
          this.authenticate()
        }
      },
      computed: {
      },
      components: {
        TrellisAlert
      }
    }
</script>
