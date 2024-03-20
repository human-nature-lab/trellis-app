<script lang="ts" setup>
import { ref } from 'vue'
import FormService from '../../services/form'
import global from '../../static/singleton'
import formType from '../../static/form.types'
import { i18n } from '@/i18n'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError, alert } from '@/helpers/log.helper'
import Form from '@/entities/trellis/Form'
import TrellisFileUpload from './TrellisFileUpload.vue'

const props = defineProps<{
  value: boolean
  formType: formType
}>()
const emit = defineEmits<{
  (event: 'importedForm', importedForm: Form): void
}>()
const isWorking = ref(false)

async function importForm (file: File) {
  try {
    isWorking.value = true
    const name = file.name.replace('.json', '')
    const importedForm = await FormService.importForm(global.study.id, name, props.formType, file)
    emit('importedForm', importedForm)
    alert('success', i18n.t('import_success'))
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('import_failed'))
      throw err
    }
  } finally {
    isWorking.value = false
  }
}

</script>

<template>
  <TrellisFileUpload
    :value="value"
    @input="$emit('input', $event)"
    :title="$t('import_form')"
    :extensions="['json']"
    :show-button="true"
    :upload-file="importForm"
  />
  <!-- <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <v-text-field
            label="Form name"
            v-model="formName"
            required
          />
          <file-upload
            input-id="form"
            class="v-btn primary"
            extensions="csv"
            v-model="files"
            :drop="true"
            @input="importForm"
          >
            <TrellisLoadingCircle
              size="25px"
              v-if="isWorking"
            />
            <div
              class="btn__content"
              v-else
            >
              {{ $t('import_form') }}
            </div>
          </file-upload>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout> -->
</template>
