<template>
  <div>
    <ul>
      <li>
        Calculating total size of images...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="warnings.length > 0" class="amber--text">WARNING.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <span v-if="warnings.length > 0" class="amber--text">
      <p>{{ warnings[warnings.length - 1] }}</p>
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
      v-if="!checking && !success && !error"
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
    import config from '@/config'
    import SyncService from '../../services/SyncService'
    import DeviceService from '@/services/device/DeviceService'
    import formatBytesFilter from '@/filters/format-bytes.filter'
    export default {
      name: 'calculate-image-size',
      data () {
        return {
          success: false,
          warning: 0,
          warnings: [],
          error: false,
          checking: false,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: '',
          photosFound: 0
        }
      },
      created () {
        this.calculateImageSize()
      },
      props: {
        imagesToDownload: Array
      },
      methods: {
        calculateImageSize: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          console.log('this.imagesToDownload', this.imagesToDownload)
          Promise.all([
            DeviceService.getFreeDiskSpace(),
            SyncService.getImageFileList(this.source, this.imagesToDownload)
          ])
            .then((results) => {
              this.checking = false
              const freeDiskSpace = results[0]
              const serverList = results[1]
              console.log('freeDiskSpace', freeDiskSpace)
              console.log('serverList', serverList)
              let totalImageSize = serverList['total_size']
              let photosRequested = serverList['photos_requested']
              this.photosFound = serverList['photos_found']
              if (this.photosFound < photosRequested) {
                this.warnings.push(`Requested ${photosRequested} images and the server only found ${this.photosFound}.`)
              }
              if (totalImageSize > freeDiskSpace) {
                this.warnings.push(`The images require ${formatBytesFilter(totalImageSize)} to download and this device only has ${formatBytesFilter(freeDiskSpace)} free.`)
              }
              if (this.warnings.length === 0) {
                console.log('totalImageSize', totalImageSize, 'freeDiskSpace', freeDiskSpace)
                console.log('photosRequested', photosRequested, 'photosFound', this.photosFound)
                this.onDone()
              }
            }).catch((error) => {
              console.log('error', error)
              this.errorMesage = error.message
              this.error = true
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
          this.$emit('calculate-image-size-done', this.photosFound)
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.calculateImageSize()
        },
        ignore: function () {
          this.warnings.pop()
          if (this.warnings.length === 0) {
            this.onDone()
          }
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
