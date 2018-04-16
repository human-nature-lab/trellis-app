<template>
  <div>
    <ul>
      <li>
        Checking for available storage space...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="warning" class="yellow--text">WARNING.</strong>
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
          errorMessage: ''
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
            console.log('snapshotFileSize', snapshotFileSize)
            console.log('deviceFreeDiskSpace', freeDiskSpace)
            if (snapshotFileSize > freeDiskSpace) {
              this.warning = true
            } else {
              this.success = true
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
          this.checkDownloadSize()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
