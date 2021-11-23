<template>
  <TrellisFileUpload
    :extensions="['csv']"
    :title="$t('import_preload_actions')"
    :uploadFile="upload" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisFileUpload from './TrellisFileUpload.vue'
  import PreloadService from '../../services/preload/PreloadService'
  import singleton from '../../static/singleton'

  export default Vue.extend({
    name: 'PreloadImport',
    components: { TrellisFileUpload },
    data () {
      return {
        busy: false
      }
    },
    methods: {
      async upload (file: File) {
        this.busy = true
        try {
          const actions = await PreloadService.importPreloadActions(singleton.study.id, file)
          console.log(actions)
        } finally {
          this.busy = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>