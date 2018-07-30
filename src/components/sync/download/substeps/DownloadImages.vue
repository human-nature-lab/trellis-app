<template>
  <div>
    <ul>
      <li>
        Downloading images...
        <strong v-if="success" class="green--text">DONE.</strong>
        <strong v-if="warning && !downloading" class="amber--text">WARNING.</strong>
        <strong v-if="error && !downloading" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <span v-if="warning" class="amber--text">
      <p>{{ warningMessage }}</p>
    </span>
    <v-progress-linear
      v-if="downloading"
      height="2"
      :indeterminate="progressIndeterminate"
      v-model="downloadProgress">
    </v-progress-linear>
    <v-btn
      v-if="!downloading && !success"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="!downloading && !success && !error"
      color="amber"
      @click.native="ignore">Ignore</v-btn>
  </div>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import SyncService from '../../../../services/sync/SyncService'
    import axios from 'axios'
    export default {
      name: 'download-images',
      data () {
        return {
          downloadProgress: 0,
          progressIndeterminate: false,
          success: false,
          error: false,
          warning: false,
          downloading: false,
          errorMessage: '',
          warningMessage: '',
          numImagesDownloaded: 0,
          failedImages: []
        }
      },
      created () {
        this.downloadImages()
      },
      props: {
        imagesToDownload: Array,
        numImagesFound: Number
      },
      methods: {
        downloadImages: function () {
          if (this.imagesToDownload.length === 0) {
            this.downloading = false
            if (!this.error && !this.warning) {
              this.onDone()
            }
          } else {
            this.downloading = true
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            const fileName = this.imagesToDownload.pop()
            SyncService.downloadImage(this.source, fileName)
              .then((response) => {
                let photo = response.data
                let fileSize = Number(response.headers['content-length'])
                return FileService.writeFile('photos', photo, fileName, fileSize)
              })
              .then(() => {
                this.numImagesDownloaded++
                this.downloadProgress = (this.numImagesDownloaded / this.numImagesFound) * 100
              })
              .catch((err) => {
                this.warning = true
                this.failedImages.push({
                  fileName: fileName,
                  error: err
                })
                this.warningMessage = err.response.statusText
              })
              .finally(() => {
                if (this.downloading) {
                  this.downloadImages()
                }
              })
          }
        },
        onDone: function () {
          this.success = true
          this.downloading = false
          console.log('onDone')
          this.$emit('download-images-done', this.numImagesDownloaded)
        },
        retry: function () {
          this.error = false
          this.downloadImages()
        },
        ignore: function () {
          this.warning = false
          this.onDone()
        },
        stopDownload: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.downloading = false
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
