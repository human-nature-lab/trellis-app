<template>
  <tr class="form-list-row">
    <td>
      <v-simple-checkbox
        :value="isSelected"
        @input="$emit('selected', $event)"
      />
    </td>
    <td class="small">
      <span
        v-show="dragging"
        class="text-button"
      >{{ studyForm.sortOrder }}</span>
      <FormActions
        :is-busy="isBusy"
        :form="form"
        :study-form="studyForm"
        @delete="$emit('delete', $event)"
        @export="exportForm"
        @publish="onPublish"
        @update:isPublished="onToggleEnabled"
        @revert="showVersionModal = true"
        @toggleFormSkips="$emit('toggleFormSkips', $event)"
      />
    </td>
    <td>
      <TranslationTextField
        :translation="memForm.nameTranslation"
        @click.stop.prevent
      />
    </td>
    <td
      v-if="Number(formType) === formTypes.CENSUS"
      style="min-width: 20em"
    >
      <v-select
        :items="censusTypes"
        v-model="studyForm.censusTypeId"
        @change="changeCensusType"
        hide-detail
      />
    </td>
    <td>
      <v-select
        :value="studyForm.currentVersionId"
        :items="form.versions"
        item-text="version"
        item-value="id"
      >
        <template #item="{ item }">
          <v-list-item>
            <v-list-item-icon>
              <v-icon
                color="success"
                v-if="!isTestStudy && item.id === studyForm.currentVersionId"
              >
                mdi-check
              </v-icon>
              <v-icon
                color="info"
                v-else-if="(isTestStudy && item.id === studyForm.currentVersionId) || (!isTestStudy && !item.isPublished)"
              >
                mdi-dev-to
              </v-icon>
            </v-list-item-icon>
            {{ item.version }} 
          </v-list-item>
        </template>
      </v-select>
      <VersionModal
        v-model="showVersionModal"
        @update:studyForm="$emit('update:studyForm', $event)"
        :study-form="studyForm"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { debounce } from 'lodash'

import Form from '@/entities/trellis/Form'
import StudyForm from '@/entities/trellis/StudyForm'
import PermissionMixin from '@/mixins/PermissionMixin'
import formTypes from '@/static/form.types'
import censusTypes from '@/static/census.types'
import singleton from '@/static/singleton'
import FormService from '@/services/form'
import TranslationTextField from '../TranslationTextField.vue'
import FormActions from './FormActions.vue'
import VersionModal from './VersionModal.vue'

export default Vue.extend({
  name: 'FormListTile',
  mixins: [PermissionMixin],
  components: {
    FormActions,
    TranslationTextField,
    VersionModal,
  },
  data () {
    return {
      isBusy: false,
      formTypes: formTypes,
      global: singleton,
      showMenu: false,
      showVersionModal: false,
      isOpen: false,
      memForm: this.form.copy(),
      saveThrottled: debounce(async () => {
        this.$emit('save', this.memForm)
      }, 2000),
    }
  },
  props: {
    form: Object as PropOptions<Form>,
    studyForm: Object as PropOptions<StudyForm>,
    formType: String,
    isSelected: Boolean,
    value: {
      type: Boolean,
    },
    dragging: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    form (newForm: Form) {
      this.memForm = newForm.copy()
    },
  },
  computed: {
    censusTypes () {
      const returnTypes = []
      for (const censusType in censusTypes) {
        returnTypes.push({
          text: this.$t(censusType),
          value: censusTypes[censusType],
        })
      }
      return returnTypes
    },
  },
  methods: {
    idFrom (key: string): string {
      return key + '-' + this.form.id
    },
    printForm () {},
    async exportForm () {
      this.isBusy = true
      try {
        await FormService.exportForm(this.form.id)
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err, 'Unable to export form')
        }
      } finally {
        this.isBusy = false
      }
    },
    async onPublish () {
      if (!confirm(this.$t('confirm_publish') as string)) {
        return
      }
      try {
        this.isBusy = true
        const res = await FormService.publishForm(this.studyForm.studyId, this.form.id)
        this.$emit('input', false)
        this.$emit('update', res)
      } catch (err) {
        this.alert('Unable to publish form', 'error')
      } finally {
        this.isBusy = false
      }
    },
    async onToggleEnabled (isPublished: boolean) {
      try {
        this.isBusy = true
        const f = this.form
        f.isPublished = isPublished
        const res = await FormService.updateForm(f)
        this.$emit('input', false)
        this.$emit('update', res)
      } catch (err) {
        this.alert('Unable to update form', 'error')
      } finally {
        this.isBusy = false
      }
    },
    save () {
      this.$emit('save', this.memForm)
    },
    changeSortOrder (sortOrder) {
      const sf = this.studyForm.copy()
      sf.sortOrder = sortOrder
      this.$emit('changeStudyForm', sf)
    },
    changeCensusType (censusTypeId) {
      const sf = this.studyForm.copy()
      sf.censusTypeId = censusTypeId
      this.$emit('changeStudyForm', sf)
    },
  },
})
</script>

<style lang="sass" scoped>

</style>
