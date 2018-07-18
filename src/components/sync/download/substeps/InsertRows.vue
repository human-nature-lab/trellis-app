<template>
  <div>
    <ul>
      <li>
        {{ workMessage }}
        <strong v-if="success" class="green--text">DONE.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
        <strong v-if="warning" class="amber--text">CANCELLED.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <span v-if="warning" class="amber--text">
      <p>{{ warningMessage }}</p>
    </span>
    <v-progress-linear
      v-show="working"
      height="2"
      v-model="insertProgress">
    </v-progress-linear>
    <v-btn
      v-if="!success && !working"
      color="primary"
      @click.native="retry">Retry</v-btn>
    <v-btn
      v-if="working && !cancelled"
      flat
      @click.native="cancelImport">Cancel</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import DatabaseService from '@/services/database/DatabaseService'
    export default {
      name: 'insert-rows',
      data () {
        return {
          workMessage: 'Importing database...',
          cancelled: false,
          success: false,
          warning: false,
          error: false,
          working: false,
          apiRoot: config.apiRoot,
          errorMessage: '',
          warningMessage: '',
          progressIndeterminate: false,
          insertProgress: 0
        }
      },
      created () {
        this.startWork()
      },
      props: ['extractedSnapshot'],
      methods: {
        startWork: function () {
          this.working = true
          this.workMessage = 'Importing database...'
          console.log('this.extractedSnapshot', this.extractedSnapshot)
          DatabaseService.importDatabase(this.extractedSnapshot, this.trackProgress, this.isCancelled)
            .then(() => {
              this.working = false
              if (this.cancelled) {
                this.warning = true
                this.warningMessage = 'Operation cancelled by user.'
              } else {
                this.success = true
                this.$emit('insert-rows-done')
              }
            },
            (error) => {
              console.error(error)
              this.working = false
              this.error = true
              this.errorMessage = error
            })
        },
        cancelImport: function () {
          this.cancelled = true
          this.workMessage = 'Rolling back transaction...'
        },
        isCancelled: function () {
          return this.cancelled
        },
        retry: function () {
          this.clearErrors()
          this.startWork()
        },
        trackProgress: function (progress) {
          this.insertProgress = (progress.inserted / progress.total) * 100
        },
        clearErrors: function () {
          this.cancelled = false
          this.warning = false
          this.warningMessage = false
          this.error = false
          this.errorMessage = false
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
