<template>
  <v-flex>
    <file-upload
      input-id="respondent-condition-tag"
      class="btn primary"
      extensions="csv"
      :drop="true"
      @input="importConditionTags" >
      <TrellisLoadingCircle size="25px" v-if="isWorking" />
      <div class="btn__content" v-else>
        {{$t('import_respondent_tags')}}
      </div>
    </file-upload>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'
  import ConditionTagService from '../../services/condition-tag'

  export default Vue.extend({
    name: 'RespondentConditionTagImport',
    components: { FileUpload, TrellisLoadingCircle },
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
