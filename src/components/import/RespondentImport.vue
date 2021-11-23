<template>
  <TrellisFileUpload
    :extensions="['csv']"
    :title="$t('import_respondents')"
    :uploadFile="importRespondents" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentImport',
    components: { TrellisFileUpload },
    methods: {
      async importRespondents (file: File) {
        try {
          const respondents = await RespondentService.importRespondents(file, global.study.id)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
