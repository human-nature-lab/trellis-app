<template>
  <TrellisFileUpload 
    :extensions="['csv']"
    :uploadFile="importRespondentGeos"
    :title="$t('import_respondent_geos')" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import RespondentService from '../../services/respondent/RespondentService'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentGeoImport',
    components: { TrellisFileUpload },
    methods: {
      async importRespondentGeos (file: File) {
        try {
          await RespondentService.importRespondentGeos(file, global.study.id)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
