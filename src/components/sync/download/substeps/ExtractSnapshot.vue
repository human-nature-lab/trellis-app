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
      :indeterminate="true">
    </v-progress-linear>
    <v-btn
      v-if="error || warning"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="extracting"
      flat
      @click.native="stopExtraction">Cancel</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import ZipService from '@/services/zip/ZipService'
    // import FileService from '@/services/file/FileService'
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
          warningMessage: ''
        }
      },
      created () {
        this.extractSnapshot()
      },
      props: ['fileEntry'],
      methods: {
        extractSnapshot: function () {
          this.extracting = true
          ZipService.unzipFile(this.fileEntry)
            .then((unzippedFile) => {
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
        stopExtraction: function () {
          this.extracting = false
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
