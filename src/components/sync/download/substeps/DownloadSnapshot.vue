<template>
  <div>
    <ul>
      <li>
        Downloading the latest snapshot...
        <strong v-if="success" class="green--text">DONE.</strong>
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
      v-if="downloading"
      height="2"
      :indeterminate="progressIndeterminate"
      v-model="downloadProgress">
    </v-progress-linear>
    <v-btn
      v-if="error || warning"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="downloading"
      flat
      @click.native="stopDownload">Cancel</v-btn>
  </div>
</template>

<script>
    import axios from 'axios'
    import config from '@/config'
    import SyncService from '../../services/SyncService'
    import FileService from '@/services/file/FileService'
    export default {
      name: 'download-snapshot',
      data () {
        return {
          downloadProgress: 0,
          progressIndeterminate: false,
          lastProgressEvent: 0,
          lastDownloadProgress: 0,
          success: false,
          warning: false,
          error: false,
          downloading: false,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: '',
          warningMessage: ''
        }
      },
      created () {
        this.downloadSnapshot()
      },
      props: {
        snapshotId: {
          type: String,
          required: true
        },
        snapshotFileSize: {
          type: Number,
          required: true
        }
      },
      methods: {
        downloadSnapshot: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.downloading = true
          SyncService.downloadSnapshot(this.source, this.onDownloadProgress, this.snapshotId).then((response) => {
            console.log('downloadSnapshot, response', response)
            let fileName = this.snapshotId + '.sql.zip'
            let snapshot = response.data
            let fileSize = Number(response.headers['content-length'])
            console.log('fileSize', fileSize)
            FileService.writeFile('snapshots', snapshot, fileName, fileSize)
              .then(
                (fileEntry) => {
                  this.success = true
                  this.$emit('download-snapshot-done', fileEntry)
                  this.downloading = false
                },
                (error) => {
                  this.errorMessage = error.message
                  this.error = true
                  this.downloading = false
                })
          }).catch((error) => {
            this.errorMessage = error.message
            this.error = true
            this.downloading = false
          })
        },
        onDownloadProgress: function (progressEvent) {
          if (this.lastDownloadProgress !== progressEvent.loaded) {
            this.lastProgressEvent = Date.now()
          }
          this.lastDownloadProgress = progressEvent.loaded
          if (progressEvent.lengthComputable) {
            this.progressIndeterminate = false
            this.downloadProgress = (progressEvent.loaded / progressEvent.total) * 100
          } else {
            this.progressIndeterminate = true
          }
        },
        stopDownload: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.downloading = false
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.downloadSnapshot()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
