<template>
  <Permission :requires="TrellisPermission.IMPORT_RESPONDENTS" web-only>
    <v-layout>
      <v-spacer />
      <v-btn
        @click="showRespondentsUpload = true"
        color="primary">
        {{$t('import_respondents')}} <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
      <v-btn
        @click="showRespondentPhotosUpload = true"
        color="primary">
        {{$t('import_respondent_photos')}} <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
      <TrellisModal v-model="showRespondentsUpload" :title="$t('import_respondents')">
        <v-layout column>
          <v-flex>
            Respondents can be imported in bulk using a CSV file. The columns for the CSV should have two columns with the headers "id" and "name". The "id" will be used to connect other imported data with this respondent. Respondent photos can be imported and are matched with respondents by this id.
          </v-flex>
          <v-flex>
            <file-upload
              class="btn"
              extensions="csv"
              :drop="true"
              @input="importRespondents" >
              <TrellisLoadingCircle size="25px" v-if="isWorking" />
              <div class="btn__content" v-else>
                {{$t('choose_file')}}
              </div>
            </file-upload>
          </v-flex>
        </v-layout>
      </TrellisModal>
      <TrellisModal v-model="showRespondentPhotosUpload" :title="$t('import_respondent_photos')">
        <v-layout column>
          <v-flex>
            Respondent photos can be imported in bulk by uploading a zip file with respondent photos named with the id of the respondent they belong to. This id is the same id used when uploading respondents.
          </v-flex>
          <v-flex>
            <file-upload
              class="btn"
              extensions="zip"
              :drop="true"
              @input="importRespondentPhotos">
              <TrellisLoadingCircle size="25px" v-if="isWorking" />
              <div class="btn__content" v-else>
                {{$t('choose_file')}}
              </div>
            </file-upload>
          </v-flex>
        </v-layout>
      </TrellisModal>
    </v-layout>
  </Permission>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Permission from '../Permission.vue'
  import global from '../../static/singleton'
  import RespondentService from '../../services/respondent/RespondentService'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import TrellisModal from '../TrellisModal.vue'
  import FileUpload from 'vue-upload-component'

  export default Vue.extend({
    name: 'ImportRespondents',
    components: {
      Permission,
      TrellisModal,
      FileUpload,
      TrellisLoadingCircle
    },
    data () {
      return {
        showRespondentsUpload: false,
        showRespondentPhotosUpload: false,
        isWorking: false,
        global
      }
    },
    methods: {
      async importRespondents (files: object[]) {
        try {
          this.isWorking = true
          const respondents = await RespondentService.importRespondents(files[0]['file'], this.global.study.id)
          this.alert('success', `Imported ${respondents.length} respondents!`)
          this.$emit('import-respondents', respondents)
          this.showRespondentsUpload = false
        } catch (err) {
          this.log(err)
          let message = err.message
          if (err && err.response && err.response.data && err.response.data.msg) {
            message = err.response.data.msg
          }
          this.alert('error', message, {timeout: 0})
        } finally {
          this.isWorking = false
        }
      },
      async importRespondentPhotos (files: object[]) {
        try {
          this.isWorking = true
          await RespondentService.importRespondentPhotos(files[0]['file'], this.global.study.id)
          this.alert('success', 'Imported photos!')
          this.$emit('import-photos')
          this.showRespondentPhotosUpload = false
        } catch (err) {
          this.log(err)
          let message = err.message
          if (err && err.response && err.response.data && err.response.data.msg) {
            message = err.response.data.msg
          }
          this.alert('error', message, {timeout: 0})
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
