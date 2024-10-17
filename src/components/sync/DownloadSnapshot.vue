<template>
  <v-col>
    <SyncStepper
      v-on="$listeners"
      :start="start"
    />
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import SyncStepper from './SyncStepper.vue'
import { VueController } from '@/modules/sync/controller'
import { runDownload } from '@/modules/sync/run-download'

export default Vue.extend({
  name: 'DownloadSnapshot',
  components: { SyncStepper },
  props: {
    onlyPhotos: Boolean,
  },
  methods: {
    async start (ctrl: VueController) {
      const run = runDownload(ctrl, this.onlyPhotos)
      return run()
    },
  },
})
</script>

<style lang="sass">

</style>
