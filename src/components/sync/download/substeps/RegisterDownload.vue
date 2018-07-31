<template>
  <div>
    <ul>
      <li>
        Registering successful download...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <v-progress-linear
      v-if="working"
      height="2"
      :indeterminate="true">
    </v-progress-linear>
    <v-btn
      v-if="!success && !working"
      color="primary"
      @click.native="retry">Retry</v-btn>
  </div>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    export default {
      name: 'register-download',
      data () {
        return {
          success: false,
          error: false,
          working: false,
          errorMessage: ''
        }
      },
      created () {
        this.registerDownload()
      },
      props: [],
      methods: {
        registerDownload: function () {
          this.working = true
          DatabaseService.checkForeignKeys()
            .then(() => {
              this.working = false
              this.success = true
              this.$emit('register-download-done')
            })
            .catch((err) => {
              console.error(err)
              this.working = false
              this.error = true
              this.errorMessage = err
            })
        },
        retry: function () {
          this.error = false
          this.registerDownload()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
