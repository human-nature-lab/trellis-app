<template>
  <sync-sub-step
    :working="removing"
    :success-message="$t('done')"
    :success="success"
    :current-log="currentLog"
    :retry="retry">
    {{ status.message }}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'remove-database',
      data () {
        return {
          success: false,
          removing: false,
          currentLog: undefined,
          status: {
            message: this.$t('removing_db')
          }
        }
      },
      created () {
        this.removeDatabase()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default' () { return defaultLoggingService }
        }
      },
      methods: {
        async removeDatabase () {
          this.removing = true
          try {
            const dbLoc = cordova.file.applicationStorageDirectory + 'databases/trellis'
            if (await FileService.existsUrl(dbLoc)) {
              await FileService.deleteUrl(dbLoc)
            }
            this.success = true
            this.$emit('remove-database-done')
          } catch (err) {
            this.currentLog = await this.loggingService.log(err)
          } finally {
            this.removing = false
          }
        },
        retry () {
          this.currentLog = undefined
          this.removeDatabase()
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
