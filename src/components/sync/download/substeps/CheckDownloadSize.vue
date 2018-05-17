<template>
  <div>
    <ul>
      <li>
        Checking for available storage space...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="warning" class="amber--text">WARNING.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <span v-if="warning">
      <p>{{ warningMessage }}</p>
    </span>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="error || warning"
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
      name: 'check-download-size',
      data () {
        return {
          success: false,
          warning: false,
          error: false,
          checking: false,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: '',
          warningMessage: ''
        }
      },
      created () {
        this.checkDownloadSize()
      },
      props: {
        snapshotId: {
          type: String,
          required: true
        }
      },
      methods: {
        checkDownloadSize: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          SyncService.getSnapshotFileSize(this.source, this.snapshotId).then((snapshotFileSize) => {
            const freeDiskSpace = DeviceService.getFreeDiskSpace()
            if (snapshotFileSize > freeDiskSpace) {
              this.warning = true
              this.warningMessage = `The snapshot is ${snapshotFileSize}B and you only have ${freeDiskSpace}B free.`
            } else {
              this.success = true
              this.$emit('check-download-size-done', snapshotFileSize)
            }
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
          this.warning = false
          this.checkDownloadSize()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
