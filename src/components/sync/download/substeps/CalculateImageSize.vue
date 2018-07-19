<template>
  <div>
    <ul>
      <li>
        Checking for images to download...
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
    import config from '@/config'
    import SyncService from '../../services/SyncService'
    import DeviceService from '@/services/device/DeviceService'
    import formatBytesFilter from '@/filters/format-bytes.filter'
    export default {
      name: 'calculate-image-size',
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
          totalImageSize: 0
        }
      },
      created () {
        this.calculateImageSize()
      },
      props: {
      },
      methods: {
        calculateImageSize: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          DeviceService.getFreeDiskSpace().then((freeDiskSpace) => {
            SyncService.getImageFileList(this.source).then((imageList) => {
              this.checking = false
              console.log('imageList', imageList)
              let totalImageSize = 0
              imageList.forEach(image => {
                totalImageSize += image.length
              })
              if (totalImageSize > freeDiskSpace) {
                this.warning = true
                this.warningMessage = `The images require ${formatBytesFilter(totalImageSize)} to download and this device only has ${formatBytesFilter(freeDiskSpace)} free.`
              } else {
                console.log('totalImageSize', totalImageSize, 'freeDiskSpace', freeDiskSpace)
                this.onDone()
              }
            }).catch((error) => {
              this.errorMessage = error
              this.error = true
            })
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
          this.$emit('calculate-image-size-done', this.totalImageSize)
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.calculateImageSize()
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
