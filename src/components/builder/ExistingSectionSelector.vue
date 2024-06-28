<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import Translation from './Translation.vue'
import builderService from '@/services/builder'
import StudyForm from '@/entities/trellis/StudyForm'
import TranslationModel from '@/entities/trellis/Translation'
import { logError } from '@/helpers/log.helper'
import { useBuilder } from '@/helpers/builder.helper'
import { useStudy } from '@/helpers/singleton.helper'
import TranslationService from '@/services/TranslationService'

type FS = {
  sectionId: string
  formId: string
  sectionTranslation: TranslationModel
  formTranslation: TranslationModel
}

const builder = useBuilder()
const study = useStudy()

const loading = ref(false)
const studyForms = ref([] as StudyForm[])

const load = async () => {
  loading.value = true
  try {
    studyForms.value = await builderService.getStudyFormSections(study.value.id)
    console.log(studyForms.value)
  } catch (err) {
    logError(err)
  } finally {
    loading.value = false
  }
}

watch(study, () => {
  if (study.value && study.value.id) {
    load()
  }
}, { immediate: true })

const sections = computed(() => {
  const sections: FS[] = []
  for (const sf of studyForms.value) {
    if (sf.form) {
      for (const s of sf.form.sections) {
        sections.push({
          sectionId: s.id,
          formId: sf.form.id,
          sectionTranslation: s.nameTranslation,
          formTranslation: sf.form.nameTranslation,
        })
      }
    }
  }
  return sections
})

const formId = ref('')
const sectionId = ref('')

const forms = computed(() => {
  return sections.value.map(s => {
    return {
      text: TranslationService.getAny(s.formTranslation, builder.locale),
      value: s.formId,
    }
  })
})

const formSections = computed(() => {
  if (!formId.value) {
    return []
  }
  return sections.value.filter(s => s.formId === formId.value).map(s => {
    return {
      text: TranslationService.getAny(s.sectionTranslation, builder.locale),
      value: s.sectionId,
    }
  })
})
</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-row
      v-else
      class="no-gutters"
    >
      <v-select
        v-model="formId"
        :items="forms"
        @change="sectionId = ''"
        label="Form"
      />
      <v-select
        v-model="sectionId"
        :items="formSections"
        label="Section"
        :disabled="!formId"
      />
    </v-row>
    <v-row class="no-gutters">
      {{ formId }} : {{ sectionId }}
      <v-spacer />
      <v-btn
        @click="$emit('select', sectionId)"
        :disabled="!sectionId"
      >
        {{ $t('select') }}
      </v-btn>
    </v-row>
  </v-col>
</template>

<style lang="sass" scoped>
  .section-row:hover
    background-color: grey
    color: white
</style>
