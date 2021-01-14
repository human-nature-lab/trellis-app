<template>
  <InfoBlock
    :title="$t('logs')"
    :to="{ name: 'Logs' }"
    :items="items"/>
</template>

<script lang="ts">
  import {defaultLoggingService as logger} from '../../services/logging/LoggingService'
  import Vue from 'vue'
  import InfoBlock from './InfoBlock.vue'
  export default Vue.extend({
    name: 'LogsInfo',
    components: { InfoBlock },
    data () {
      return {
        totalLogs: {
          key: this.$t('logs'),
          val: null
        },
        uploaded: {
          key: this.$t('uploaded'),
          val: null
        }
      }
    },
    created () {
      logger.getLogCount().then(c => this.totalLogs.val = c)
      logger.getUploadedCount().then(c => this.uploaded.val = c)
    },
    computed: {
      items (): object[] {
        return [this.totalLogs, this.uploaded]
      }
    }
  })
</script>

<style scoped>

</style>
