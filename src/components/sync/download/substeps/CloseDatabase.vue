<template>
  <SyncSubStep
    :working="isWorking"
    :currentLog="currentLog"
    :retry="close"
    :success="isDone">
    {{$t('closing_db')}}
  </SyncSubStep>
</template>

<script lang="ts">
  import Vue from 'vue'
  import SyncSubStep from '../../SyncSubStep.vue'
  import DatabaseService from '../../../../services/database'

  export default Vue.extend({
    name: 'CloseDatabase',
    components: {
      SyncSubStep
    },
    props: {
      loggingService: Object
    },
    data () {
      return {
        isWorking: false,
        isDone: false,
        currentLog: null
      }
    },
    mounted () {
      this.close()
    },
    methods: {
      async close () {
        if (this.isWorking || this.isDone) return
        this.isWorking = true
        try {
          await DatabaseService.closeDatabase()
          this.isDone = true
          this.$emit('done')
        } catch (err) {
          this.currentLog = await this.loggingService.log(err)
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>