<template>
  <TrellisFileUpload 
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['csv']"
    :uploadFile="importRespondentGeos"
    :title="$t('import_respondent_geos')">
    <template #error="{ error }">
      {{error.response.data.msg}}
    </template>
  </TrellisFileUpload>
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
      importRespondentGeos (file: File) {
        return RespondentService.importRespondentGeos(file, global.study.id)
      }
    }
  })
</script>
