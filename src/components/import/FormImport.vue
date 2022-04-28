<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <v-text-field label="Form name" v-model="formName" required></v-text-field>
          <file-upload
            input-id="form"
            class="v-btn primary"
            extensions="csv"
            v-model="files"
            :drop="true"
            @input="importForm" >
            <TrellisLoadingCircle size="25px" v-if="isWorking" />
            <div class="btn__content" v-else>
              {{$t('import_form')}}
            </div>
          </file-upload>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FormService from '../../services/form'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'
  import formType from '../../static/form.types'

  export default Vue.extend({
    name: 'FormImport',
    components: { TrellisLoadingCircle, FileUpload },
    data () {
      return {
        formName: '',
        global,
        isWorking: false,
        files: []
      }
    },
    props: {
      formType: {
        type: Number,
        required: true
      }
    },
    methods: {
      async importForm (files: object[]) {
        try {
          this.isWorking = true
          const importedForm = await FormService.importForm(this.global.study.id, this.formName, this.formType, files[0]['file'])
          this.$emit('importedForm', importedForm)
          this.alert('success', this.$t('import_success'))
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
