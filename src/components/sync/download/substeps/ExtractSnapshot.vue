<template>
  <div>
    <ul>
      <li>
        Extracting the snapshot...
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
      v-if="extracting"
      height="2"
      :indeterminate="progressIndeterminate"
      v-model="extractProgress">
    </v-progress-linear>
    <v-btn
      v-if="!extracting && !success"
      color="primary"
      @click.native="retry">Retry</v-btn>
  </div>
</template>

<script>
    import config from '../../../../config'
    import ZipService from '../../../../services/zip/ZipService'
    export default {
      name: 'download-snapshot',
      data () {
        return {
          success: false,
          warning: false,
          error: false,
          extracting: false,
          apiRoot: config.apiRoot,
          source: null,
          errorMessage: '',
          warningMessage: '',
          progressIndeterminate: true,
          extractProgress: 0.0
        }
      },
      created () {
        this.extractSnapshot()
      },
      props: ['fileEntry'],
      methods: {
        extractSnapshot: function () {
          this.extracting = true
          ZipService.unzipFile(this.fileEntry, this.progressCallback)
            .then((unzippedFile) => {
              console.log('unzippedFile', unzippedFile)
              this.extracting = false
              this.success = true
              this.$emit('extract-snapshot-done', unzippedFile)
            },
            (error) => {
              this.extracting = false
              this.error = true
              this.errorMessage = error.data
            })
        },
        progressCallback: function (progressEvent) {
          console.log('progressEvent2', progressEvent)
          this.progressIndeterminate = false
          this.extractProgress = (progressEvent.loaded / progressEvent.total) * 100
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.extractSnapshot()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
