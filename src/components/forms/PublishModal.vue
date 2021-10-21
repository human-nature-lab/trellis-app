<template>
  <TrellisModal
    title="publish_form"
    :value="value" @input="$emit('input', $event)">
    <v-container>
      <v-row>
        <AsyncTranslationText :translation="studyForm.form.nameTranslation" />
      </v-row>
      <v-row>
        <v-select
          :label="$t('versions')"
          v-model="version" 
          :loading="loading"
          item-value="id"
          :items="versions">
          <template #item="{ item: form }">
            v{{form.version}}
            <span v-if="form.id === studyForm.currentVersionId"> (dev)</span>
            <span v-if="form.published === '1' || form.published"> (published)</span>
          </template>
          <template #selection="{ item: form}">
            v{{form.version}}
            <span v-if="form.id === studyForm.currentVersionId"> (dev)</span>
          </template>
        </v-select>
      </v-row>
      <v-row>
        <v-btn
          @click="publish"
          :disabled="loading || !version">
          {{$t('publish')}}
        </v-btn>
      </v-row>
    </v-container>
  </TrellisModal>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Form from '../../entities/trellis/Form'
  import FormService from '../../services/form/FormService'
  import TrellisModal from '../TrellisModal.vue'
  import AsyncTranslationText from '../AsyncTranslationText.vue'
  import StudyForm from '../../entities/trellis/StudyForm'

  export default Vue.extend({
    components: { TrellisModal, AsyncTranslationText },
    name: 'PublishModal',
    props: {
      value: Boolean,
      studyForm: Object as PropOptions<StudyForm>,
    },
    data () {
      return {
        version: null,
        versions: [],
        loading: false,
      }
    },
    watch: {
      value () {
        this.load()
      },
    },
    methods: {
      async load () {
        this.loading = true
        try {
          this.versions = await FormService.getVersions(this.studyForm.formMasterId)
          this.version = this.studyForm.currentVersionId
        } catch (err) {

        } finally {
          this.loading = false
        }
      },
      async publish () {
        
      },
    },
  })
</script>

<style lang="sass">
  
</style>