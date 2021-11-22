<template>
  <TrellisFileUpload
    extensions="csv"
    @input="importRespondents">
    {{$t('import_respondents')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentImport',
    components: { TrellisFileUpload },
    data () {
      return {
        global,
        isWorking: false
      }
    },
    methods: {
      async importRespondents (files: object[]) {
        try {
          this.isWorking = true
          const respondents = await RespondentService.importRespondents(files[0]['file'], this.global.study.id)
          this.alert('success', this.$t('import_success'))
          this.$emit('import-respondents', respondents)
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
