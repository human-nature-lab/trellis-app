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
      v-model="downloadProgress">
    </v-progress-linear>
    <v-btn
      v-if="!downloading && !success"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="downloading"
      flat
      @click.native="stopDownload">Stop</v-btn>
  </div>
</template>

<script>
    import axios from 'axios'
    import config from '../../../../config'
    import FileService from '../../../../services/file/FileService'
    export default {
      name: 'download-snapshot',
      data () {
        return {
          downloadProgress: 0,
          progressIndeterminate: true,
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
      beforeDestroy () {
        this.stopDownload()
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
          const fileName = this.snapshotId + '.sql.zip'
          const uri = config.apiRoot + `/sync/snapshot/${this.snapshotId}/download`
          FileService.requestFileSystem()
            .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
            .then((directoryEntry) => FileService.getFileEntry(directoryEntry, fileName))
            .then((fileEntry) => FileService.download(uri, fileEntry, this.onDownloadProgress))
            .then((fileEntry) => {
              console.log('FileService.download -> fileEntry', fileEntry)
              this.success = true
              this.$emit('download-snapshot-done', fileEntry)
              this.downloading = false
            })
            .catch((err) => {
              this.errorMessage = err.message
              this.error = true
              this.downloading = false
            })
          /*
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
          */
        },
        onDownloadProgress: function (progressEvent) {
          let curProgress = (progressEvent.loaded / progressEvent.total) * 100
          // Only update at 5% increments, without this the progress bar does not update
          if ((curProgress - this.downloadProgress) > 5) {
            this.downloadProgress = curProgress
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
