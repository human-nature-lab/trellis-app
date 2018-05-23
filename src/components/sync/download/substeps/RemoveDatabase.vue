<template>
  <div>
    <ul>
      <li>
        Removing database...
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <v-progress-linear
      v-if="removing"
      height="2"
      :indeterminate="true">
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
      name: 'remove-database',
      data () {
        return {
          success: false,
          error: false,
          removing: false,
          apiRoot: config.apiRoot,
          errorMessage: ''
        }
      },
      created () {
        this.removeDatabase()
      },
      props: [],
      methods: {
        removeDatabase: function () {
          this.removing = true
          DatabaseService.removeDatabase()
            .then(() => {
              this.removing = false
              this.$emit('remove-database-done')
            },
            (error) => {
              console.error(error)
              this.removing = false
              this.error = true
              this.errorMessage = error
            })
        },
        retry: function () {
          this.error = false
          this.removeDatabase()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
