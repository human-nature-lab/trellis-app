<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['csv']"
    :title="$t('import_preload_actions')"
    :uploadFile="upload">
    <template #error="{ error }">
      {{error.response.data.msg}}
    </template>
    <template #response="{ response }">
      <TrellisDataTable
        download
        filename="imported-preload-actions.csv"
        :headers="headers"
        :items="response" />
    </template>
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisFileUpload from './TrellisFileUpload.vue'
  import PreloadService from '../../services/preload/PreloadService'
  import singleton from '../../static/singleton'
  const TrellisDataTable = () => import('../TrellisDataTable.vue')

  export default Vue.extend({
    name: 'PreloadImport',
    components: { TrellisFileUpload, TrellisDataTable },
    data () {
      return {
        headers: [{
          text: 'Type',
          value: 'actionType'
        }, {
          text: 'Payload',
          value: 'payload'
        }, {
          text: 'Question',
          value: 'questionId'
        }, {
          text: 'Respondent',
          value: 'respondentId'
        }]
      }
    },
    methods: {
      upload (file: File) {
        return PreloadService.importPreloadActions(singleton.study.id, file)
      }
    }
  })
</script>

<style lang="sass">
  
</style>