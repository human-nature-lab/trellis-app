<template>
  <TrellisModal
    title="revert_version"
    :value="value" 
    @input="$emit('input', $event)">
    <v-container v-if="value">
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
          <template #item="{ on, item: form }">
            <v-list-item v-on="on">
              <v-list-item-icon>
                <v-icon color="success" v-if="!isTestStudy && form.id === studyForm.currentVersionId">
                  mdi-check
                </v-icon>
                <v-icon color="info" 
                  v-else-if="(isTestStudy && form.id === studyForm.currentVersionId) || (!isTestStudy && !form.isPublished)">
                  mdi-dev-to
                </v-icon>
              </v-list-item-icon>
              v{{form.version}}
            </v-list-item>
          </template>
          <template #selection="{ item: form}">
            v{{form.version}}
            <v-icon 
              color="info" 
              v-if="(isTestStudy && form.id === studyForm.currentVersionId) || (!isTestStudy && !form.isPublished)">
              mdi-dev-to
            </v-icon>
          </template>
        </v-select>
      </v-row>
      <v-row>
        <v-btn
          @click="revert"
          :disabled="loading || !version">
          {{$t('revert_version')}}
        </v-btn>
      </v-row>
    </v-container>
  </TrellisModal>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import FormService from '../../services/form'
  import TrellisModal from '../TrellisModal.vue'
  import AsyncTranslationText from '../AsyncTranslationText.vue'
  import StudyForm from '../../entities/trellis/StudyForm'
  import PermissionMixin from '../../mixins/PermissionMixin'

  export default Vue.extend({
    mixins: [PermissionMixin],
    components: { TrellisModal, AsyncTranslationText },
    name: 'VersionModal',
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
        try {
          this.loading = true
          this.versions = await FormService.getVersions(this.studyForm.formMasterId)
          this.versions = this.versions.filter(v => v.isPublished)
          this.version = this.studyForm.currentVersionId
        } catch (err) {
          this.log(err)
        } finally {
          this.loading = false
        }
      },
      async revert () {
        try {
          this.loading = true
          const studyForm = await FormService.revertVersion(this.studyForm.formMasterId, this.version)
          this.$emit('update:studyForm', studyForm)
          await this.load()
          this.$emit('input', false)
        } catch (err) {
          this.log(err)
        } finally {
          this.loading = false
        }
      },
    },
  })
</script>

<style lang="sass">
  
</style>