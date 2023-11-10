<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router/composables'
import TranslationEditor, { TranslationRow } from '@/components/builder/TranslationEditor.vue'
import Form from '@/entities/trellis/Form'
import FormService from '@/services/form'
import TranslationText from '@/entities/trellis/TranslationText'
import Translation from '@/entities/trellis/Translation'
import { logError } from '@/helpers/log.helper'

const route = useRoute()
const form = ref<Form>()
const loading = ref(false)

watch(() => route.params.formId, async (formId) => {
  try {
    loading.value = true
    form.value = await FormService.getForm(formId)
  } catch (err) {
    logError(err)
  } finally {
    loading.value = false
  }
}, { immediate: true })

const translations = computed(() => {
  const res: TranslationRow[] = []
  if (!form) return res
  res.push({
    type: 'form',
    ownerId: form.value.id,
    translation: form.value.nameTranslation,
  })
  for (const section of form.value.sections) {
    res.push({
      type: 'section',
      ownerId: section.id,
      translation: section.nameTranslation,
    })
    for (const qg of section.questionGroups) {
      for (const question of qg.questions) {
        res.push({
          type: 'question',
          ownerId: question.id,
          translation: question.questionTranslation,
        })
        for (const choice of question.choices) {
          res.push({
            type: 'choice',
            ownerId: choice.choice.id,
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
  console.log('update', tt)
  const ttIndex = translationMap.value[tt.translationId].translationText.findIndex(t => t.id === tt.id)
  if (ttIndex > -1) {
    translationMap.value[tt.translationId].translationText[ttIndex] = tt
  } else {
    translationMap.value[tt.translationId].translationText.push(tt)
  }
}

</script>

<template>
  <v-container>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <h3>{{ $t('edit_translations') }}</h3>
    <v-container>
      <TranslationEditor
        v-if="form"
        :translations="translations"
        @update="translationTextChange"
        @create="translationTextChange"
      />
    </v-container>
  </v-container>
</template>
