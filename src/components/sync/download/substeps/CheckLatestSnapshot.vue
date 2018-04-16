<template>
  <div>
    <ul>
      <li>
        Checking latest available snapshot on the server...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
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
    export default {
      name: 'check-latest-snapshot',
      data () {
        return {
          success: false,
          error: false,
          checking: false,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: ''
        }
      },
      created () {
        this.checkLatestSnapshot()
      },
      props: {
      },
      methods: {
        checkLatestSnapshot: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          SyncService.getLatestSnapshot(this.source).then((serverLatestSnapshot) => {
            this.$emit('check-latest-snapshot-done', serverLatestSnapshot)
            this.success = true
            this.checking = false
          }).catch((error) => {
            this.errorMessage = error
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
          this.checkLatestSnapshot()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
