<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['csv']"
    :title="$t('import_respondents')"
    :uploadFile="importRespondents">
    <template #error="{ error }">
      <div v-html="error.response.data" />
    </template>
    <template #response="{ response: respondents }">
      <TrellisDataTable
        :headers="headers"
        :items="respondents"
        download 
        filename="imported-respondents.csv" />
    </template>
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'
  const TrellisDataTable = () => import('../TrellisDataTable.vue')

  export default Vue.extend({
    name: 'RespondentImport',
    components: { TrellisFileUpload, TrellisDataTable },
    data () {
      return {
        headers: [{
          text: 'Id',
          value: 'id',
        }, {
          text: 'Assigned Id',
          value: 'assignedId',
        }, {
          text: 'Name',
          value: 'name',
        }, {
          text: 'Photos',
          value: 'photos.length',
        }, {
          text: 'Condition tags',
          value: 'respondentConditionTags.length'
        }]
      }
    },
    methods: {
      importRespondents (file: File) {
        return RespondentService.importRespondents(file, global.study.id)
      }
    }
  })
</script>
