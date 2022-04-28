<template>
  <SyncSubStep
    :working="isMoving"
    :success-message="$t('done')"
    :success="isDone"
    :current-log="currentLog"
    :retry="move">
    {{ message }}
  </SyncSubStep> 
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import SyncSubStep from '../../SyncSubStep.vue'
  import FileService from '../../../../services/file'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging'

  export default Vue.extend({
    name: 'MoveDatabase',
    components: { SyncSubStep },
    data () {
      return {
        isMoving: false,
        isDone: false,
        currentLog: null,
        message: this.$t('moving_db')
      }
    },
    props: {
      loggingService: <PropOptions<typeof LoggingService>>{
        type: Object,
        default: function () { return defaultLoggingService }
      }
    },
    mounted () {
      this.move()
    },
    methods: {
      async move () {
        if (this.isMoving || this.isDone) return
        this.isMoving = true
        try {
          // @ts-ignore
          const dbUrl = cordova.file.applicationStorageDirectory + 'databases/trellis'
          // @ts-ignore
          const snapshotUrl = cordova.file.applicationStorageDirectory + 'files/files/snapshots/snapshot.db'
          console.log(dbUrl, snapshotUrl)
          await FileService.moveUrl(snapshotUrl, dbUrl)
          this.isDone = true
          this.$emit('done')
        } catch (err) {
          this.currentLog = await this.loggingService.log(err)
        } finally {
          this.isMoving = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>