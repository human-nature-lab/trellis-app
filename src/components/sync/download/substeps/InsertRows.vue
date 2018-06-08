<template>
  <div>
    <ul>
      <li>
        Importing database...
        <strong v-if="success" class="green--text">DONE.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <v-progress-linear
      v-show="working"
      height="2"
      v-model="insertProgress">
    </v-progress-linear>
    <v-btn
      v-if="error"
      color="primary"
      @click.native="retry">Retry</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import DatabaseService from '@/services/database/DatabaseService'
    export default {
      name: 'insert-rows',
      data () {
        return {
          success: false,
          error: false,
          working: false,
          apiRoot: config.apiRoot,
          errorMessage: '',
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
          DatabaseService.importDatabase(this.extractedSnapshot, this.trackProgress)
            .then(() => {
              this.working = false
              this.success = true
              this.$emit('insert-rows-done')
            },
            (error) => {
              console.error(error)
              this.working = false
              this.error = true
              this.errorMessage = error
            })
        },
        retry: function () {
          this.error = false
          this.startWork()
        },
        trackProgress: function (progress) {
          this.insertProgress = (progress.inserted / progress.total) * 100
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
