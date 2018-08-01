<template>
  <div>
    <ul>
      <li>
        Checking foreign key constraints...
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
    <v-btn
      v-if="error"
      color="amber"
      @click.native="ignore">Ignore</v-btn>
  </div>
</template>

<script>
    import config from '@/config'
    import DatabaseService from '@/services/database/DatabaseService'
    export default {
      name: 'check-foreign-keys',
      data () {
        return {
          success: false,
          error: false,
          working: false,
          apiRoot: config.apiRoot,
          errorMessage: ''
        }
      },
      created () {
        this.checkForeignKeys()
      },
      props: [],
      methods: {
        checkForeignKeys: function () {
          this.working = true
          DatabaseService.checkForeignKeys()
            .then(() => {
              this.working = false
              this.success = true
              this.$emit('check-foreign-keys-done')
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
          this.checkForeignKeys()
        },
        ignore: function () {
          this.error = false
          this.success = true
          this.$emit('check-foreign-keys-done')
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>
