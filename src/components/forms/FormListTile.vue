<script lang="ts" setup>
import { ref, watch, computed } from 'vue'

import Form from '@/entities/trellis/Form'
import StudyForm from '@/entities/trellis/StudyForm'
import formTypes from '@/static/form.types'
import censusTypes from '@/static/census.types'
import FormService from '@/services/form'
import TranslationTextField from '../TranslationTextField.vue'
import FormActions from './FormActions.vue'
import VersionModal from './VersionModal.vue'
import { i18n } from '@/i18n'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError, alert } from '@/helpers/log.helper'
import { isTestStudy } from '@/helpers/singleton.helper'

const props = defineProps<{
  form: Form
  studyForm: StudyForm
  formType: string
  isSelected: boolean
  value?: boolean
  dragging: boolean
}>()

const emit = defineEmits<{
  (event: 'save', form: Form): void
  (event: 'input', value: boolean): void
  (event: 'update', res: any): void
  (event: 'changeStudyForm', studyForm: StudyForm): void
  (event: 'delete', form: Form): void
  (event: 'selected', value: boolean): void
  (event: 'toggleFormSkips', value: boolean): void
  (event: 'update:studyForm', studyForm: StudyForm): void
}>()

const isBusy = ref(false)
const showVersionModal = ref(false)
const memForm = ref<Form | null>()

watch(() => props.form, (newForm: Form) => {
  if (newForm) {
    memForm.value = newForm.copy()
  }
}, { immediate: true })

const censusTypeList = computed(() => {
  const returnTypes = []
  for (const censusType in censusTypes) {
    returnTypes.push({
      text: i18n.t(censusType),
      value: censusTypes[censusType],
    })
  }
  return returnTypes
})

async function exportForm () {
  isBusy.value = true
  try {
    await FormService.exportForm(props.form.id)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, 'Unable to export form')
    }
  } finally {
    isBusy.value = false
  }
}

async function onPublish () {
  if (!confirm(i18n.t('confirm_publish') as string)) {
    return
  }
  isBusy.value = true
  try {
    const res = await FormService.publishForm(props.studyForm.studyId, props.form.id)
    emit('input', false)
    emit('update', res)
  } catch (err) {
    alert('Unable to publish form', 'error')
  } finally {
    isBusy.value = false
  }
}

async function onToggleEnabled (isPublished: boolean) {
  try {
    const f = props.form
    f.isPublished = isPublished
    const res = await FormService.updateForm(f)
    emit('input', false)
    emit('update', res)
  } catch (err) {
    alert('Unable to update form', 'error')
  } finally {
    isBusy.value = false
  }
}

function changeCensusType (censusTypeId: number) {
  const sf = props.studyForm.copy()
  sf.censusTypeId = censusTypeId
  emit('changeStudyForm', sf)
}

</script>

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
        :items="censusTypeList"
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
