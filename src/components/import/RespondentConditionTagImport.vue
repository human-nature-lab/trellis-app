<template>
  <TrellisFileUpload
    input-id="respondent-condition-tag"
    extensions="csv"
    @input="importConditionTags">
    {{$t('import_respondent_tags')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import ConditionTagService from '../../services/condition-tag'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentConditionTagImport',
    components: { TrellisFileUpload },
    data () {
      return {
        isWorking: false,
        global
      }
    },
    methods: {
      async importConditionTags (files: File[]) {
        try {
          this.isWorking = true
          await ConditionTagService.importRespondentConditionTags(files[0]['file'], this.global.study.id)
          this.alert('success', 'Imported respondent condition tags successfully')
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('import_failed'))
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
