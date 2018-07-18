<template>
  <div>
    <ul>
      <li>
        Verifying the download...
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
      v-if="verifying"
      height="2"
      :indeterminate="true">
    </v-progress-linear>
    <v-btn
      v-if="error || warning"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="warning"
      color="amber"
      @click.native="ignore">Ignore</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import FileService from '@/services/file/FileService'
    export default {
      name: 'verify-download',
      data () {
        return {
          success: false,
          warning: false,
          error: false,
          verifying: false,
          apiRoot: config.apiRoot,
          errorMessage: '',
          warningMessage: ''
        }
      },
      created () {
        this.verifyDownload()
      },
      props: ['fileEntry', 'fileHash'],
      methods: {
        verifyDownload: function () {
          this.verifying = true
          FileService.calculateMD5Hash(this.fileEntry)
            .then((md5Hash) => {
              console.log('serverProvidedHash', this.fileHash)
              console.log('calculatedMd5Hash', md5Hash)
              if (md5Hash === this.fileHash) {
                this.verifying = false
                this.success = true
                this.verificationDone()
              } else {
                this.verifying = false
                this.warning = true
                this.warningMessage = 'Calculated hash does not match hash reported by the server.'
              }
            },
            (error) => {
              this.extracting = false
              this.error = true
              console.error(error)
              this.errorMessage = error.data
            })
        },
        verificationDone: function () {
          this.$emit('verify-download-done')
        },
        ignore: function () {
          this.warning = false
          this.success = true
          this.verificationDone()
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.verifyDownload()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
