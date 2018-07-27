<template>
  <div>
    <ul>
      <li>
        Establishing connection with the server...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <error :show="error" :error="`Unable to establish a connection with the server at ${apiRoot}`"></error>
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
    import Error from '../../../Error.vue'
    export default {
      name: 'check-connection',
      data () {
        return {
          success: false,
          error: false,
          checking: false,
          apiRoot: config.apiRoot,
          source: null
        }
      },
      created () {
        this.checkConnection()
      },
      props: {
      },
      methods: {
        checkConnection: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          SyncService.getHeartbeat(this.source).then(() => {
            this.success = true
            this.checking = false
            this.$emit('connection-ok')
          }).catch(() => {
            this.error = true
            this.checking = false
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
          this.checkConnection()
        }
      },
      computed: {
      },
      components: {
        Error
      }
    }
</script>
