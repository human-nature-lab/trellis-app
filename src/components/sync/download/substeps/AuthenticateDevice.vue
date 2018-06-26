<template>
  <div>
    <ul>
      <li>
        Authenticating device...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>The device was not found on the server, please see an administrator for a resolution.</p>
    </span>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="error"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="checking"
      flat
      @click.native="stopChecking">Cancel</v-btn>
  </div>
</template>

<script>
    import axios from 'axios'
    import config from '@/config'
    import SyncService from '../../services/SyncService'
    import DeviceService from '@/services/device/DeviceService'
    export default {
      name: 'authenticate-device',
      data () {
        return {
          success: false,
          error: false,
          checking: true,
          apiRoot: config.apiRoot,
          source: null
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
            }).catch(() => {
              this.error = true
              this.checking = false
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
          this.authenticate()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
