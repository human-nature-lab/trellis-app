<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
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
      importConditionTags (file: File) {
        return ConditionTagService.importRespondentConditionTags(file, global.study.id)
      }
    }
  })
</script>
