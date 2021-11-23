<template>
  <TrellisFileUpload
    extensions="csv"
    input-id="preload-actions"
    @input="upload">
    {{$t('import_preload_actions')}}
  </TrellisFileUpload>
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
      async upload (files: object[]) {
        this.busy = true
        try {
          const actions = await PreloadService.importPreloadActions(singleton.study.id, files[0]['file'])
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