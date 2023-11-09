<script lang="ts" setup>
import { computed, ref } from 'vue'
import Question from '@/entities/trellis/Question'
import Translation from './Translation.vue'
import QuestionHeader from './QuestionHeader.vue'
import QuestionParameters from './QuestionParameters.vue'
import QuestionChoices from './QuestionChoices.vue'
import questionTypes from '@/static/question.types'
import QuestionConditions from './QuestionConditions.vue'
import builderService from '@/services/builder'
import ExpandSection from './ExpandSection.vue'
import DistributionQuestionBuilder from './question-builders/DistributionQuestionBuilder.vue'
import { logError } from '@/helpers/log.helper'
import { useBuilder } from '@/helpers/builder.helper'
import QuestionPreview from './QuestionPreview.vue'

const props = defineProps<{
  value: Question
}>()

const builder = useBuilder()
const working = ref(false)
const showParameters = ref(props.value && !!props.value.questionParameters.length)
const showChoices = ref(props.value.questionTypeId === questionTypes.multiple_choice ||
props.value.questionTypeId === questionTypes.multiple_select)
const showConditions = ref(props.value && !!props.value.assignConditionTags.length)

const isChoiceType = computed(() => {
  return props.value.questionTypeId === questionTypes.multiple_choice ||
  props.value.questionTypeId === questionTypes.multiple_select
})

const isDistributionType = computed(() => {
  return props.value.questionTypeId === questionTypes.distribution
})
async function updateQuestion () {
  console.log('Question.vue@updateQuestion')
  if (working.value) return
  working.value = true
  showChoices.value = isChoiceType.value
  try {
    await builderService.updateQuestion(props.value)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

const inPreview = ref(false)

</script>

<template>
  <v-col class="mb-4">
    <QuestionHeader
      :value="value"
      :show-parameters.sync="showParameters"
      :show-conditions.sync="showConditions"
      :show-choices.sync="showChoices"
      :allow-choices="isChoiceType"
      @change="updateQuestion"
      @remove="$emit('remove')"
      @duplicate="$emit('duplicate')"
      :in-preview="inPreview"
      @toggle-preview="inPreview = !inPreview"
      :loading="working"
    />
    <v-col
      v-if="!inPreview"
      class="ma-0 pa-0"
    >
      <v-col class="question-content">
        <Translation
          :locale="builder.locale"
          :locked="builder.locked"
          v-model="value.questionTranslation"
          class="text-body-1"
          autogrow
          editable
          textarea
        />
        <ExpandSection
          v-if="isDistributionType"
          v-model="isDistributionType"
          global
        >
          <v-col>
            <DistributionQuestionBuilder
              :locked="builder.locked"
              :value="value"
              @input="$emit('input', $event)"
            />
          </v-col>
        </ExpandSection>
        <v-col>
          <ExpandSection
            v-if="isChoiceType"
            v-model="showChoices"
            global
          >
            <QuestionChoices
              :question-id="value.id"
              :disabled="builder.locked"
              v-model="value.choices"
              :locale="builder.locale"
            />
          </ExpandSection>
          <ExpandSection
            v-model="showParameters"
            global
          >
            <QuestionParameters
              v-if="showParameters"
              :disabled="builder.locked || !value.questionTypeId"
              v-model="value.questionParameters"
              :parameters="builder.parameters"
              :condition-tags="builder.conditionTags"
              :locale="builder.locale"
              :geo-types="builder.geoTypes"
              :question-id="value.id"
              :question-type-id="value.questionTypeId"
              :choices="value.choices"
            />
          </ExpandSection>
          <ExpandSection
            v-model="showConditions"
            global
          >
            <QuestionConditions
              v-if="showConditions"
              :question-id="value.id"
              :condition-tags="builder.conditionTags"
              :disabled="builder.locked"
              v-model="value.assignConditionTags"
            />
          </ExpandSection>
        </v-col>
      </v-col>
    </v-col>
    <v-col v-else>
      <QuestionPreview
        :question="value"
        :form="builder.form"
      />
    </v-col>
  </v-col>
</template>

<style lang="sass">

.lowercase
  text-transform: lowercase
.question-content
  border: 1px solid lightgrey
.theme--dark
  .question-content
    border: 1px solid darken(lightgrey, 50)
</style>
