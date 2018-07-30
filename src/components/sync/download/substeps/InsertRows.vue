<template>
  <div>
    <ul>
      <li>
        {{ workMessage }}
        <strong v-if="success" class="green--text">DONE.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
        <strong v-if="warning" class="amber--text">DONE.</strong>
      </li>
    </ul>
    <trellis-alert :show="error" :message="errorMessage"></trellis-alert>
    <trellis-alert :show="warning" :message="warningMessage"></trellis-alert>
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
      @click.native="cancelImport">Stop</v-btn>
  </div>
</template>

<script>
    import config from '../../../../config'
    import DatabaseService from '../../../../services/database/DatabaseService'
    import TrellisAlert from '../../../TrellisAlert.vue'
    // Additional cancelled variable not bound to the component
    let cancelled = false
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
      beforeDestroy () {
        this.cancelImport()
      },
      created () {
        this.startWork()
      },
      props: ['extractedSnapshot'],
      methods: {
        startWork: function () {
          this.working = true
          this.workMessage = 'Importing database...'
          DatabaseService.importDatabase(this.extractedSnapshot, this.trackProgress, this.isCancelled)
            .then(() => {
              this.working = false
              if (this.cancelled) {
                this.warning = true
                this.warningMessage = 'Importing database cancelled by user.'
              } else {
                this.onDone()
              }
            })
            .catch((err) => {
              console.error(err)
              this.working = false
              this.error = true
              this.errorMessage = err
            })
        },
        cancelImport: function () {
          this.cancelled = cancelled = true
          this.workMessage = 'Rolling back transaction...'
        },
        isCancelled: function () {
          return cancelled
        },
        onDone: function () {
          this.success = true
          this.$emit('insert-rows-done')
        },
        retry: function () {
          this.clearErrors()
          this.startWork()
        },
        trackProgress: function (progress) {
          this.insertProgress = (progress.inserted / progress.total) * 100
        },
        clearErrors: function () {
          this.cancelled = cancelled = false
          this.warning = false
          this.warningMessage = false
          this.error = false
          this.errorMessage = false
        }
      },
      computed: {
      },
      components: {
        TrellisAlert
      }
    }
</script>
