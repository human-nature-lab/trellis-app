<template>
  <v-flex>
    <file-upload
      input-id="respondent"
      class="btn primary"
      extensions="csv"
      :drop="true"
      @input="importRespondents" >
      <TrellisLoadingCircle size="25px" v-if="isWorking" />
      <div class="btn__content" v-else>
        {{$t('import_respondents')}}
      </div>
    </file-upload>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'

  export default Vue.extend({
    name: 'RespondentImport',
    components: { TrellisLoadingCircle, FileUpload },
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
