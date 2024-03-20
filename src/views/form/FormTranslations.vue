<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router/composables'
import TranslationEditor, { TranslationRow } from '@/components/builder/TranslationEditor.vue'
import Form from '@/entities/trellis/Form'
import FormService from '@/services/form'
import TranslationText from '@/entities/trellis/TranslationText'
import Translation from '@/entities/trellis/Translation'
import { logError, alert } from '@/helpers/log.helper'
import Papa from 'papaparse'
import TrellisFileUpload from '@/components/import/TrellisFileUpload.vue'
import TranslationTextService from '@/services/translation-text'
import { DocService } from '@/services/doc'

const route = useRoute()
const form = ref<Form>()
const loading = ref(false)
const showImport = ref(false)

async function loadForm (formId: string) {
  try {
    loading.value = true
    form.value = await FormService.getForm(formId)
    form.value.sort()
  } catch (err) {
    logError(err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.formId, loadForm, { immediate: true })

function sortByLocale (a: TranslationText, b: TranslationText) {
  return a.locale.languageTag.localeCompare(b.locale.languageTag)
}

const translations = computed(() => {
  const res: TranslationRow[] = []
  if (!form) return res
  const f = form.value
  f.nameTranslation.translationText.sort(sortByLocale)
  res.push({
    type: 'form',
    ownerId: form.value.id,
    translation: f.nameTranslation,
  })
  for (const section of form.value.sections) {
    section.nameTranslation.translationText.sort(sortByLocale)
    res.push({
      type: 'section',
      ownerId: section.id,
      translation: section.nameTranslation,
    })
    for (const qg of section.questionGroups) {
      for (const question of qg.questions) {
        question.questionTranslation.translationText.sort(sortByLocale)
        res.push({
          type: 'question',
          ownerId: question.id,
          varName: question.varName,
          translation: question.questionTranslation,
        })
        for (const choice of question.choices) {
          choice.choice.choiceTranslation.translationText.sort(sortByLocale)
          res.push({
            type: 'choice',
            ownerId: choice.choice.id,
            varName: question.varName,
            translation: choice.choice.choiceTranslation,
          })
        }
      }
    }
  }
  return res
})

const translationMap = computed(() => {
  const res: Record<string, Translation> = {}
  for (const t of translations.value) {
    res[t.translation.id] = t.translation
  }
  return res
})

function translationTextChange (tt: TranslationText) {
  const ttIndex = translationMap.value[tt.translationId].translationText.findIndex(t => t.id === tt.id)
  if (ttIndex > -1) {
    translationMap.value[tt.translationId].translationText[ttIndex] = tt
  } else {
    translationMap.value[tt.translationId].translationText.push(tt)
  }
}

async function exportToCSV () {
  const csv = await DocService.formToTranslationCsv(form.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const english = form.value.nameTranslation.translationText.find(tt => tt.locale.languageTag === 'en')
  const name = DocService.getFormName(form.value, english.locale, 'csv', '_translations')
  return DocService.saveAs(blob, name)
}

function parseCsv (file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (res) => {
        if (!res.data.length) {
          reject(new Error('No data found in CSV'))
        } else if (res.errors.length) {
          reject(new Error(res.errors.map(e => e.message).join('\n')))
        }
        resolve(res)
      },
      error: (err) => {
        reject(err)
      },
    })
  })
}

async function importTranslations (file: File) {
  const res = await parseCsv(file)
  if (!res.data.length) {
    throw new Error('No data found in CSV')
  }
  console.log(res)
  // make sure all of the translation ids exist in this form
  for (const t of res.data) {
    if (!t.translation_id) {
      throw new Error('Missing translation_id')
    } else if (!translationMap.value[t.translation_id]) {
      throw new Error(`Translation with id ${t.translation_id} not found`)
    }
  }

  const languageTags = new Map<string, string>()
  for (const t of translations.value) {
    for (const tt of t.translation.translationText) {
      languageTags.set(tt.locale.languageTag, tt.localeId)
    }
  }
  // for each row, check if the translation text matches the existing. If not, add it to the update queue
  const updating: TranslationText[] = []
  const creating: TranslationText[] = []
  for (const t of res.data) {
    const translation = translationMap.value[t.translation_id]
    for (const [tag, localeId] of languageTags) {
      const newText = t[tag].trim()
      const tt = translation.translationText.find(tt => tt.localeId === localeId)
      if (tt) {
        if (newText !== tt.translatedText.trim()) {
          console.log('Updating', tt.id, newText, tt.translatedText)
          updating.push(new TranslationText().fromSnakeJSON({
            id: tt.id,
            translation_id: translation.id,
            translated_text: newText,
            locale_id: localeId,
          }))
        }
      } else if (newText !== '') {
        creating.push(new TranslationText().fromSnakeJSON({
          translation_id: translation.id,
          translated_text: newText,
          locale_id: localeId,
        }))
      }
    }
  }

  console.log('Updating', updating, 'Creating', creating)
  const confirmMsg = `You are about to update ${updating.length} translations and create ${creating.length}. Are you sure you want to continue?`
  if ((updating.length || creating.length) && confirm(confirmMsg)) {
    try {
      const updated = await Promise.all(
        updating.map(tt => TranslationTextService.updateTranslatedTextById(tt.id, tt.translatedText)),
      )
      const created = await Promise.all(
        creating.map(tt => TranslationTextService.createTranslationText(tt.translationId, tt)),
      )
      console.log('Updated', updated, 'Created', created)
      loadForm(route.params.formId)
      alert('success', `Updated ${updated.length} translations and created ${created.length} new translations`)
    } catch (err) {
      logError(err)
    }
  } else {
    alert('info', 'No translations were updated')
  }
  showImport.value = false
}

</script>

<template>
  <v-container>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-row no-gutters>
      <h3>{{ $t('edit_translations') }}</h3>
      <v-spacer />
      <v-btn
        @click="exportToCSV"
        :disabled="loading"
        class="mx-2"
      >
        Export CSV
      </v-btn>
      <v-btn
        @click="showImport = true"
        :disabled="loading"
        class="mx-2"
      >
        Import CSV
      </v-btn>
      <v-btn
        :disabled="loading"
        @click="loadForm(route.params.formId)"
        icon
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-row>
    <v-container>
      <TranslationEditor
        v-if="form"
        :translations="translations"
        @update="translationTextChange"
        @create="translationTextChange"
      />
    </v-container>
    <TrellisFileUpload
      v-model="showImport"
      :title="$t('import_translations')"
      :extensions="['csv']"
      :upload-file="importTranslations"
    >
      <template #error="{ error }">
        <div v-html="error.response.data" />
      </template>
    </TrellisFileUpload>
  </v-container>
</template>
