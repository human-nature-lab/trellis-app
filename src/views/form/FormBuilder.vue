<script lang="ts" setup>
import { computed, provide, reactive, ref, watch } from 'vue'
import Form from '@/entities/trellis/Form'
import SectionModel from '@/entities/trellis/Section'
import FormService from '@/services/form'
import ConditionTagService from '@/services/condition-tag'
import Section from '@/components/builder/Section.vue'
import singleton from '@/static/singleton'
import ConditionTag from '@/entities/trellis/ConditionTag'
import QuestionType from '@/entities/trellis/QuestionType'
import builderService from '@/services/builder'
import Translation from '@/components/builder/Translation.vue'
import BuilderMenu from '@/components/builder/BuilderMenu.vue'
import { builder as builderSymbol, questionErrors } from '@/symbols/builder'
import { study } from '@/symbols/main'
import Parameter from '@/entities/trellis/Parameter'
import GeoType from '@/entities/trellis/GeoType'
import GeoTypeService from '@/services/geotype'
import SortableList, { Added, Moved } from '@/components/util/SortableList.vue'
import FormSection from '@/entities/trellis/FormSection'
import TrellisModal from '@/components/TrellisModal.vue'
import ExistingSectionSelector from '@/components/builder/ExistingSectionSelector.vue'
import { useRoute } from 'vue-router/composables'
import { logError } from '@/helpers/log.helper'
import { useBuilderQuestionErrors } from '@/helpers/builder.helper'

const $route = useRoute()
const isLoading = ref(true)
const showSectionSelector = ref(false)
const builder = reactive({
  form: null as Form,
  locale: singleton.locale ? singleton.locale.copy() : null,
  locked: true,
  questionTypes: [] as QuestionType[],
  parameters: [] as Parameter[],
  conditionTags: [] as ConditionTag[],
  geoTypes: [] as GeoType[],
})

provide(builderSymbol, builder)
provide(study, reactive(singleton.study))
provide(questionErrors, useBuilderQuestionErrors(() => builder.form))

async function load () {
  isLoading.value = true
  try {
    const [form, tags, questionTypes, parameters, geoTypes] = await Promise.all([
      FormService.getForm($route.params.formId),
      ConditionTagService.all(),
      builderService.getQuestionTypes(),
      builderService.getParameterTypes(),
      GeoTypeService.allStudyGeoTypes(singleton.study.id),
    ])
    questionTypes.sort((a, b) => a.name.localeCompare(b.name))
    form.sort()
    parameters.sort((a, b) => a.name.localeCompare(b.name))
    tags.sort((a, b) => a.name.localeCompare(b.name))
    builder.form = form
    builder.questionTypes = questionTypes
    builder.conditionTags = tags
    builder.parameters = parameters
    builder.geoTypes = geoTypes
  } catch (err) {
    logError(err)
  } finally {
    isLoading.value = false
  }
}

async function addSection () {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const section = await builderService.createSection($route.params.formId, { sort_order: builder.form.sections.length })
    builder.form.sections.push(section)
    builder.form.sections = builder.form.sections.slice()
  } catch (err) {
    logError(err)
  } finally {
    isLoading.value = false
  }
}

async function addExistingSection (sectionId: string) {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const section = await builderService.linkSection($route.params.formId, sectionId)
    builder.form.sections.push(section)
    builder.form.sections = builder.form.sections.slice()
  } catch (err) {
    logError(err)
  } finally {
    isLoading.value = false
  }
}

async function removeSection (section: SectionModel) {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await builderService.removeSection(section.formSections[0].id)
    const index = builder.form.sections.indexOf(section)
    if (index > -1) {
      builder.form.sections.splice(index, 1)
    }
  } catch (err) {
    logError(err)
  } finally {
    isLoading.value = false
  }
}

async function updateFormSection (s: FormSection) {
  try {
    isLoading.value = true
    await builderService.updateFormSection(s)
  } catch (err) {
    logError(err)
  } finally {
    isLoading.value = false
  }
}

function sectionMoved (e: Moved<SectionModel> | Added<SectionModel>) {
  const fs = e.element.formSections[0]
  fs.sortOrder = e.newIndex
  updateFormSection(fs)
}

watch(() => $route, load, { immediate: true })

</script>

<template>
  <v-col class="bg-grey lighten-3 min-h-screen form-builder">
    <v-col class="w-full w-max-normal mx-auto">
      <v-row
        v-if="builder.form"
        no-gutters
        class="sticky align-center background"
      >
        <div class="title">
          <Translation
            editable
            :locked="builder.locked"
            v-model="builder.form.nameTranslation"
            :locale="builder.locale"
          />
        </div>
        <v-spacer />
        <BuilderMenu
          class="mr-6"
          :locale.sync="builder.locale"
          :locked.sync="builder.locked"
          :form-id="builder.form.id"
          @add-section="addSection"
          @refresh="load"
          @add-existing-section="showSectionSelector = true"
        />
      </v-row>
      <v-progress-linear
        v-if="isLoading"
        indeterminate
      />
      <SortableList
        v-if="builder.form"
        :value="builder.form.sections"
        handle=".section-handle"
        @moved="sectionMoved"
        :disabled="builder.locked"
        tag="v-col"
      >
        <template #item="{ index, item: section }">
          <Section
            :key="section.formSections[0].id"
            v-model="builder.form.sections[index]"
            @remove="removeSection(section)"
          />
        </template>
      </SortableList>
      <v-col v-if="builder.form" />
    </v-col>
    <TrellisModal
      v-model="showSectionSelector"
      :title="$t('sections')"
    >
      <ExistingSectionSelector @select="addExistingSection" />
    </TrellisModal>
  </v-col>
</template>

<style lang="sass">
.form-builder
  .sticky
    position: sticky !important
    top: 0
    z-index: 2
</style>
