<template>
  <div>
    <ul>
      <li>
        Emptying the snapshots directory...
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
      v-if="working"
      height="2"
      :indeterminate="true">
    </v-progress-linear>
    <v-btn
      v-if="error || warning"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="warning"
      color="warning"
      @click.native="ignore">Ignore</v-btn>
    <v-btn
      v-if="working"
      flat
      @click.native="stopWork">Cancel</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import FileService from '@/services/file/FileService'
    export default {
      name: 'empty-snapshots-directory',
      data () {
        return {
          success: false,
          warning: false,
          error: false,
          working: false,
          apiRoot: config.apiRoot,
          errorMessage: '',
          warningMessage: ''
        }
      },
      created () {
        this.startWork()
      },
      methods: {
        startWork: function () {
          this.working = true
          FileService.requestFileSystem()
            .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
            .then((directoryEntry) => FileService.emptyDirectory(directoryEntry))
            .then(() => {
              this.working = false
              this.success = true
              this.workDone()
            },
            (error) => {
              this.working = false
              this.error = true
              console.error(error)
              this.errorMessage = error.data
            })
        },
        workDone: function () {
          this.$emit('empty-snapshots-directory-done')
        },
        stopWork: function () {
          this.working = false
        },
        ignore: function () {
          this.warning = false
          this.success = true
          this.workDone()
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.startWork()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
