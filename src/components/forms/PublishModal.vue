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
          :items="versions">
          <template #item="{ item: form }">
            <v-list-item>
              v{{form.version}}
              <span v-if="form.id === studyForm.currentVersionId"> (most recent)</span>
              <span v-if="form.published === '1' || form.published"> (published)</span>
            </v-list-item>
          </template>
          <template #selection="{ item: form}">
            v{{form.version}}
            <span v-if="form.id === studyForm.currentVersionId"> (most recent)</span>
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
          this.version = this.versions.find(v => v.id === this.studyForm.currentVersionId)
        } catch (err) {

        } finally {
          this.loading = false
        }
      },
      async publish () {
        if (!this.version) {
          return alert('Select a version to publish')
        } else if (this.studyForm.currentVersionId && 
          this.studyForm.currentVersionId !== this.version.id && 
          !confirm('You are attempting to publish an old version. Is this desired?')) {
          return
        }
        this.loading = true
        try {
          const res = await FormService.publishForm(this.studyForm.studyId, this.version.id)
          this.$emit('input', false)
          this.$emit('close')
        } catch (err) {
          this.alert('Unable to publish form', 'error')
        } finally {
          this.loading = false
        }
      },
    },
  })
</script>

<style lang="sass">
  
</style>