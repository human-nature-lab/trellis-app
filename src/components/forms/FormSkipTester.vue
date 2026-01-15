<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import StudyForm from '@/entities/trellis/StudyForm'
import ConditionTagAutocomplete from '@/components/ConditionTagAutocomplete.vue'
import SkipService from '@/services/SkipService'
import { DisplayForm } from '@/components/respondent/FormListItem.vue'
import AsyncTranslationText from '@/components/AsyncTranslationText.vue'

const props = defineProps<{
  forms: StudyForm[]
}>()

const assignedConditions = ref<string[]>([])

const assignedConditionsSet = computed(() => new Set(assignedConditions.value))

const skipService = new SkipService()

watch(() => props.forms, () => {
  skipService.clear()
  for (const sf of props.forms) {
    if (sf.form.skips && sf.form.skips.length) {
      skipService.register(sf.form.skips)
    }
  }
  skipService.register(props.forms.flatMap(sf => sf.form.skips))
}, { immediate: true })

const visibleForms = computed(() => {
  const forms = props.forms.filter(sf => {
    return !skipService.shouldSkip(
      sf.form.skips,
      assignedConditionsSet.value,
    ) && !sf.censusTypeId
  })
  forms.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })
  return forms.map(sf => {
    return {
      id: sf.currentVersionId,
      nameTranslation: sf.form.nameTranslation,
      surveys: [],
      isPublished: sf.form.isPublished,
      isSkipped: false,
      // censusTypeId: null,
      isComplete: false,
      // isStarted: sf.surveys.length > 0,
      isStarted: false,
      nComplete: 0,
      version: sf.form.version,
    } as DisplayForm
  })
})
</script>

<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Form Skip Tester</span>
    </v-card-title>
    <v-card-text>
      <ConditionTagAutocomplete
        v-model="assignedConditions"
      />
      <v-list>
        <v-list-item
          v-for="form in visibleForms"
          :key="form.id"
        >
          <AsyncTranslationText
            :translation="form.nameTranslation"
          />
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
