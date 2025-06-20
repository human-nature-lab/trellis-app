<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { groupBy } from 'lodash'
import draggable from 'vuedraggable'
import config from '@/config'
import Permission from '@/components/Permission.vue'
import StudyForm from '@/entities/trellis/StudyForm'
import FormService from '@/services/form'
import TranslationService from '@/services/TranslationService'
import formTypes from '@/static/form.types'
import global from '@/static/singleton'
import Form from '@/entities/trellis/Form'
import FormListTile from '@/components/forms/FormListTile.vue'
import TrellisModal from '@/components/TrellisModal.vue'
import FormSkips from '@/components/forms/FormSkips.vue'
import { TrellisPermission } from '@/static/permissions.base'
import DocsFiles from '@/components/documentation/DocsFiles'
import FormImport from '@/components/import/FormImport.vue'
import { delay } from '@/classes/delay'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError, alert } from '@/helpers/log.helper'
import { i18n } from '@/i18n'
import { isTestStudy } from '@/helpers/singleton.helper'
import { setDocsLink } from '@/helpers/docs.helper'
import { DocService, DocxOpts, ExcelColumn } from '@/services/doc'
import { saveAs } from 'file-saver'
import PrintOptionsForm from '@/components/print/PrintOptionsForm.vue'
import TransformService from '@/services/transform'
import TrellisFileUpload from '@/components/import/TrellisFileUpload.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'
import AlertListItem from '@/components/util/AlertListItem.vue'

const isLoading = ref(false)
const studyForms = ref<StudyForm[]>([])
const formSkipsForm = ref<StudyForm | null>(null)
const showFormSkips = ref(false)
const showImportForm = ref(false)
const importFormType = ref(formTypes.CENSUS)
const isDragging = ref(false)
const sortBy = ref('sortOrder')
const selectedForms = ref<StudyForm[]>([])
const showExport = ref(false)
const showDisabledForms = ref(isTestStudy.value)

setDocsLink(DocsFiles.getting_started + '#creating-a-form')

async function loadForms () {
  if (isLoading.value) return
  isLoading.value = true
  try {
    studyForms.value = await FormService.getAllStudyForms(global.study.id)
    showImportForm.value = false
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, 'Unable to load forms')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(loadForms)

const studyFormsByType = computed(() => {
  return groupBy(studyForms.value.filter(sf => showDisabledForms.value || sf.form.isPublished), 'formTypeId')
})

const numericFormTypes = computed(() => {
  const formTypeKeys = Object.keys(formTypes).filter(formType => {
    return (!isNaN(Number(formType)))
  })
  return formTypeKeys.filter(formType => {
    // Filter out DEFAULT_CENSUS formType until it is implemented
    return formType != formTypes.DEFAULT_CENSUS
  })
})

function headers (formType: formTypes) {
  let hdr = []

  // if (formType != formTypes.CENSUS) {
  //   hdr = hdr.concat([{
  //     text: 'Order'
  //   }])
  // }

  hdr = hdr.concat([{
    text: 'Actions',
  }, {
    text: 'Name',
    class: 'max-width',
  }])

  if (formType == formTypes.CENSUS) {
    hdr.push({
      text: 'Census type',
    })
  }

  hdr = hdr.concat([{
    text: 'Version',
    align: 'center',
  }])

  return hdr.map((h, i) => {
    h.sortable = false
    h.value = i
    h.class = h.class || 'small'
    return h
  })
}

function toggleFormSkips (form: StudyForm) {
  formSkipsForm.value = form
  showFormSkips.value = !showFormSkips.value
}

function formName (form: Form) {
  return TranslationService.getAny(form.nameTranslation, global.locale)
}

async function addForm (type: formTypes) {
  if (isLoading.value) return
  try {
    isLoading.value = true
    const studyForm = await FormService.createForm(global.study.id, type)
    studyForms.value.push(studyForm)
    alert('success', i18n.t('resource_created', [formName(studyForm.form)]))
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('failed_resource_create', [i18n.t('form')]))
    }
  } finally {
    isLoading.value = false
  }
}

async function reorderForms (evt) {
  // bail early if nothing has changed or we're currently reordering the forms
  if (isLoading.value) return
  if (evt.newIndex === evt.oldIndex) {
    isDragging.value = false
    return
  }
  isLoading.value = true
  const tempStudyForms = studyFormsByType.value[formTypes.DATA_COLLECTION_FORM]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(sf => {
      return {
        id: sf.id,
        sortOrder: undefined,
      }
    })
  const shifted = tempStudyForms[evt.oldIndex]
  tempStudyForms.splice(evt.oldIndex, 1)
  tempStudyForms.splice(evt.newIndex, 0, shifted)
  for (let i = 0; i < tempStudyForms.length; i++) {
    tempStudyForms[i].sortOrder = i + 1
  }
  try {
    const forms = await FormService.reorderForms(global.study.id, tempStudyForms)
    studyForms.value = forms
    sortBy.value = 'sortOrder'
    alert('success', i18n.t('resource_updated', [i18n.t('forms')]))
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('failed_resource_update', [i18n.t('forms')]))
    }
  } finally {
    await delay(1000)
    isDragging.value = false
    isLoading.value = false
  }
}

async function updateForm (form: Form) {
  try {
    const newForm = await FormService.updateForm(form)
    const sf = studyForms.value.find((sf: StudyForm) => sf.form.id === form.id)
    Object.assign(sf.form, newForm)
    alert('success', i18n.t('resource_updated', [formName(form)]))
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('failed_resource_update', [formName(form)]))
    }
  }
}

async function changeStudyForm (studyForm: StudyForm) {
  try {
    const newStudyForm = await FormService.updateStudyForm(studyForm.studyId, studyForm)
    const sf = studyForms.value.find((sf: StudyForm) => sf.id === newStudyForm.id)
    Object.assign(sf.form, newStudyForm)
    alert('success', i18n.t('resource_updated', [formName(studyForm.form)]))
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, i18n.t('failed_resource_update', [formName(studyForm.form)]))
    }
  }
}

async function updateStudyForm (studyForm: StudyForm) {
  const index = studyForms.value.findIndex(sf => sf.id === studyForm.id)
  if (index > -1) {
    studyForm.form = studyForms.value[index].form
    studyForms.value[index] = studyForm
  }
}

function formTypeName (formType: formTypes) {
  formType = +formType // convert to int
  switch (formType) {
    case formTypes.CENSUS:
      return i18n.t('census_forms')
    case formTypes.DEFAULT_CENSUS:
      return i18n.t('default_census_forms')
    default:
      return i18n.t('forms')
  }
}

async function deleteForm (studyForm: StudyForm) {
  if (!isLoading.value && confirm(i18n.t('confirm_resource_delete', [formName(studyForm.form)]) as string)) {
    isLoading.value = true
    try {
      await FormService.deleteForm(global.study.id, studyForm.formMasterId)
      const index = studyForms.value.findIndex(sf => sf.id === studyForm.id)
      studyForms.value.splice(index, 1)
      alert('success', i18n.t('resource_deleted', [formName(studyForm.form)]))
    } catch (err) {
      if (isNotAuthError(err)) {
        logError(err, i18n.t('failed_resource_delete', [formName(studyForm.form)]))
      }
    } finally {
      isLoading.value = false
    }
  }
}

const printOpts = ref<DocxOpts>()
async function exportForms () {
  if (isLoading.value) return
  try {
    isLoading.value = true
    const zip = await DocService.multipleFormsToDocx(
      selectedForms.value.map(sf => sf.form.id),
      global.locale,
      printOpts.value,
    )
    saveAs(zip, 'forms.zip')
  } catch (err) {
    console.error(err)
    debugger
    logError(err)
  } finally {
    isLoading.value = false
  }
}

async function exportTranslations (config: { asXlsx?: boolean } = {}) {
  if (isLoading.value) return
  try {
    isLoading.value = true
    let data = await TransformService.getFormTranslations(selectedForms.value.map(sf => sf.form.id), global.study.id)
    saveAs(data, 'trellis_form_translations.zip')
    if (config.asXlsx) {
      const columns: ExcelColumn[] = [{
        width: 10,
        alignment: { vertical: 'middle' },
      }, {
        width: 15,
        alignment: { vertical: 'middle' },
      }, {
        width: 60,
        alignment: { vertical: 'middle', wrapText: true },
      }, {
        width: 60,
        alignment: { vertical: 'middle', wrapText: true },
      }, {
        width: 10,
        alignment: { vertical: 'middle' },
      }, {
        width: 10,
        alignment: { vertical: 'middle' },
      }]
      data = await DocService.csvZipToXlsx(data, columns)
    }
    saveAs(data, `trellis_form_translations.${config.asXlsx ? 'xlsx' : 'zip'}`)
  } catch (err) {
    debugger
    logError(err)
  } finally {
    isLoading.value = false
  }
}

const showTranslationImport = ref(false)
async function importTranslations (file: File) {
  if (isLoading.value) return
  console.log('type', file.type, file.name)
  let uploadFile: File
  if (file.name.endsWith('.xlsx')) {
    uploadFile = new File([await DocService.xlsxToCsvZip(file)], file.name + '.zip')
    if (config.debug) {
      saveAs(uploadFile, 'upload.zip')
    }
    // TODO: convert to zip file with a csv file for each sheet
  } else if (file.name.endsWith('.csv')) {
    // TODO: convert to zip file containing this single csv file
    uploadFile = new File([await DocService.filesToZip(file)], file.name + '.zip')
    if (config.debug) {
      saveAs(uploadFile, 'upload.zip')
    }
  } else {
    uploadFile = file
  }
  const res = await TransformService.importFormTranslations(global.study.id, uploadFile)
  if (res.status === 200) {
    alert('success', i18n.t('translation_import_complete', [res.data.added || 0, res.data.updated || 0]))
  }
}

</script>

<template>
  <v-container>
    <v-col>
      <v-progress-linear
        v-show="isLoading"
        indeterminate
      />
      <v-card
        class="mt-4"
        v-for="formType in numericFormTypes"
        :key="formType"
      >
        <v-toolbar flat>
          <v-toolbar-title>{{ formTypeName(formType) }}</v-toolbar-title>
          <v-spacer />
          <DotsMenu>
            <v-list>
              <AlertListItem
                :requires="TrellisPermission.ADD_FORM"
                :alert-msg="$t('switch_to_test_mode')"
                @click="addForm(formType)"
                :disabled="!isTestStudy"
              >
                <v-list-item-action>
                  <v-icon>mdi-plus</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  {{ $t('add_form') }}
                </v-list-item-content>
              </AlertListItem>
              <AlertListItem
                :alert-msg="$t('switch_to_test_mode')"
                :disabled="!isTestStudy"
                :requires="TrellisPermission.ADD_FORM"
                @click="showImportForm = true; importFormType = Number(formType)"
              >
                <v-list-item-action>
                  <v-icon>mdi-swap-vertical</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  {{ $t('import_form') }}
                </v-list-item-content>
              </AlertListItem>
              <v-list-item
                @click="showExport = true"
                :disabled="!selectedForms.length"
              >
                <v-list-item-action>
                  <v-icon>mdi-file-word-box</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  {{ $t('export_word_docs') }}
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                @click="() => exportTranslations({ asXlsx: true })"
                :disabled="!selectedForms.length"
              >
                <v-list-item-action>
                  <v-icon>mdi-file-excel-box</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  {{ $t('export_translations') }}
                </v-list-item-content>
              </v-list-item>
              <Permission
                v-if="isTestStudy"
                :requires="TrellisPermission.EDIT_FORM"
              >
                <v-list-item
                  @click="showTranslationImport = true"
                  :disabled="!selectedForms.length"
                >
                  <v-list-item-action>
                    <v-icon>mdi-file-excel-box</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    {{ $t('import_translations') }}
                  </v-list-item-content>
                </v-list-item>
              </Permission>
              <v-list-item @click="showDisabledForms = !showDisabledForms">
                <v-list-item-action>
                  <v-icon>{{ showDisabledForms ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  {{ showDisabledForms ? $t('hide_disabled_forms') : $t('show_disabled_forms') }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </DotsMenu>
        </v-toolbar>
        <v-data-table
          v-model="selectedForms"
          class="forms-table"
          :sort-by.sync="sortBy"
          :headers="headers(formType)"
          hide-default-footer
          show-select
          :items-per-page="-1"
          :items="studyFormsByType[formType]"
        >
          <template #body="{ items, isSelected, select }">
            <draggable
              handle=".drag-handle"
              @start="isDragging = true"
              :list="items"
              @end="reorderForms"
              tag="tbody"
            >
              <FormListTile
                v-for="item in items"
                :key="item.id"
                :form="item.form"
                :study-form="item"
                :form-type="formType"
                :dragging="isDragging"
                v-model="item.showHidden"
                :is-selected="isSelected(item)"
                @selected="select(item, !isSelected(item))"
                @toggleFormSkips="toggleFormSkips"
                @save="updateForm"
                @update="loadForms"
                @update:studyForm="updateStudyForm"
                @changeStudyForm="changeStudyForm"
                @delete="deleteForm(item)"
              />
            </draggable>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <FormImport
      v-model="showImportForm"
      :form-type="importFormType"
      @imported-form="loadForms"
    />
    <TrellisModal
      v-model="showFormSkips"
      :title="$t('skips')"
    >
      <FormSkips
        @close="showFormSkips = false"
        v-model="formSkipsForm"
      />
    </TrellisModal>
    <TrellisModal
      v-model="showExport"
      :title="$t('export_forms')"
    >
      <v-card>
        <v-simple-table>
          <tbody>
            <tr
              v-for="f in selectedForms"
              :key="f.id"
            >
              <td>
                {{ TranslationService.getAny(f.form.nameTranslation, global.locale) }}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <PrintOptionsForm v-model="printOpts" />
        <v-card-actions>
          <v-btn
            :disabled="isLoading"
            @click="showExport = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            :disabled="isLoading"
            @click="exportForms"
            color="primary"
          >
            {{ $t('export_word_docs') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </TrellisModal>
    <TrellisFileUpload
      v-model="showTranslationImport"
      :title="$t('import_translations')"
      :upload-file="importTranslations"
      :extensions="['zip', 'csv', 'xlsx']"
      multiple
    />
  </v-container>
</template>

<style lang="sass">
.forms-table
  .small
    column-width: 20px
    width: 90px
  .medium
    width: 80px
  .drag-handle
    cursor: grab
</style>
