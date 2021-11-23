<template>
  <TrellisFileUpload
    :extensions="['csv']"
    :title="$t('import_respondent_tags')"
    :uploadFile="importConditionTags" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import ConditionTagService from '../../services/condition-tag'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentConditionTagImport',
    components: { TrellisFileUpload },
    methods: {
      async importConditionTags (file: File) {
        try {
          await ConditionTagService.importRespondentConditionTags(file, global.study.id)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
