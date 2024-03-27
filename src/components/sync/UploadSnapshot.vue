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
import { runUpload } from '@/modules/sync/run-upload'

export default Vue.extend({
  name: 'UploadSnapshot',
  props: {
    onlyPhotos: Boolean,
  },
  components: { SyncStepper },
  methods: {
    async start (ctrl: VueController) {
      const run = runUpload(ctrl, this.onlyPhotos)
      return run()
    },
  },
})
</script>

<style lang="sass">

</style>
