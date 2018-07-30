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
    <span v-if="warning" class="amber--text">
      <p>{{ warningMessage }}</p>
    </span>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="!checking && !success"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="!checking && !success && warning"
      color="amber"
      @click.native="ignore">Ignore</v-btn>
    <v-btn
      v-if="checking"
      flat
      @click.native="stopChecking">Stop</v-btn>
  </div>
</template>

<script>
    import axios from 'axios'
    import config from '../../../../config'
    import SyncService from '../../../../services/sync/SyncService'
    import DeviceService from '../../../../services/device/DeviceService'
    import formatBytesFilter from '../../../../filters/format-bytes.filter'
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
          warningMessage: '',
          snapshotFileSize: 0
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
            this.snapshotFileSize = snapshotFileSize
            const freeDiskSpace = DeviceService.getFreeDiskSpace()
            if (snapshotFileSize > freeDiskSpace) {
              this.warning = true
              this.warningMessage = `The snapshot is ${formatBytesFilter(snapshotFileSize)} and this device only has ${formatBytesFilter(freeDiskSpace)} free.`
            } else if ((snapshotFileSize * 5) > freeDiskSpace) {
              this.warning = true
              this.warningMessage = `The extracted snapshot requires ~${formatBytesFilter(snapshotFileSize * 5)} and this device only has ${formatBytesFilter(freeDiskSpace)} free.`
            } else {
              this.onDone()
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
        onDone: function () {
          this.success = true
          this.$emit('check-download-size-done', this.snapshotFileSize)
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.checkDownloadSize()
        },
        ignore: function () {
          this.warning = false
          this.warningMessage = ''
          this.onDone()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
