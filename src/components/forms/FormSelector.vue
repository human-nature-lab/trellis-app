<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormService from '@/services/form'
import StudyForm from '@/entities/trellis/StudyForm'
import AsyncTranslationText from '../AsyncTranslationText.vue'
import global from '@/static/singleton'

const props = defineProps<{
  value: string // formId
  studyId: string
  onlyPublished?: boolean
  formFilter?:(form: StudyForm) => boolean
}>()
const loading = ref(false)
const forms = ref<StudyForm[]>([])

watch(() => props.studyId, async () => {
  loading.value = true
  try {
    forms.value = await FormService.getAllStudyForms(props.studyId)
  } finally {
    loading.value = false
  }
}, { immediate: true })

const displayForms = computed(() => {
  let f = props.onlyPublished ? forms.value.filter(f => f.form && f.form.isPublished) : forms.value
  if (props.formFilter) {
    f = f.filter(props.formFilter)
  }
  return f.map(f => {
    return {
      translation: f.form.nameTranslation,
      value: f.currentVersionId,
    }
  })
})

</script>

<template>
  <div>
    <v-select
      :loading="loading"
      :items="displayForms"
      :value="value"
      @input="$emit('input', $event)"
      :label="$t('forms')"
    >
      <template #item="{ item, on }">
        <v-list-item v-on="on">
          <AsyncTranslationText :translation="item.translation" />
        </v-list-item>
      </template>
      <template #selection="{ item, on }">
        <AsyncTranslationText
          v-on="on"
          :translation="item.translation"
        />
      </template>
    </v-select>
  </div>
</template>

<style lang="sass">

</style>
