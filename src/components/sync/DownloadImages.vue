<template>
  <SyncStepper
    :start="start"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { delay } from '@/classes/delay'
import { VueController } from '@/modules/sync/controller'
import { runImageDownload } from '@/modules/sync/download-images'
import SyncStepper from './SyncStepper.vue'

export default Vue.extend({
  name: 'DownloadImages',
  components: { SyncStepper },
  methods: {
    async start (ctrl: VueController) {
      const run = await runImageDownload(ctrl)
      await delay(1000)
      return run()
    },
  },
})
</script>

<style lang="sass">

</style>
