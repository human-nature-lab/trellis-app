<script lang="ts" setup>
import { computed, ref } from 'vue'
import Question from '@/entities/trellis/Question'
import Translation from './Translation.vue'
import QuestionHeader from './QuestionHeader.vue'
import QuestionParameters from './QuestionParameters.vue'
import QuestionChoices from './QuestionChoices.vue'
import questionTypes, { choiceTypes, builderTypes } from '@/static/question.types'
import QuestionConditions from './QuestionConditions.vue'
import builderService from '@/services/builder'
import ExpandSection from './ExpandSection.vue'
import DistributionQuestionBuilder from './question-builders/DistributionQuestionBuilder.vue'
import SocialRingBuilder from './question-builders/SocialRingBuilder.vue'
import { logError } from '@/helpers/log.helper'
import { useBuilderState } from '@/helpers/builder.helper'

const props = defineProps<{
  value: Question,
}>()

const builder = useBuilderState()
const working = ref(false)
const showParameters = ref(props.value && !!props.value.questionParameters.length)
const showChoices = ref(choiceTypes.includes(props.value.questionTypeId))
const showConditions = ref(props.value && !!props.value.assignConditionTags.length)
const isBuilderType = computed(() => builderTypes.includes(props.value.questionTypeId))

const isChoiceType = computed(() => {
  return [questionTypes.multiple_choice, questionTypes.multiple_select].includes(props.value.questionTypeId)
})

const questionBuilderComponent = computed(() => {
  switch (props.value.questionTypeId) {
    case questionTypes.distribution:
      return DistributionQuestionBuilder
    case questionTypes.social_ring:
      return SocialRingBuilder
    default:
      return null
  }
})

async function updateQuestion (value: Question) {
  console.log('Question.vue@updateQuestion', value, props.value)
  if (working.value) return
  working.value = true
  showChoices.value = isChoiceType.value
  try {
    await builderService.updateQuestion(value || props.value)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}
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
      :loading="working"
    />
    <v-col
      class="question-content"
      :class="{ builder: isBuilderType }"
    >
      <Translation
        v-if="!isBuilderType"
        :locale="builder.locale"
        :locked="builder.locked"
        v-model="value.questionTranslation"
        class="text-body-1"
        autogrow
        editable
        textarea
      />
      <component
        v-if="isBuilderType"
        :is="questionBuilderComponent"
        :locked="builder.locked"
        :value="value"
        @input="$emit('input', $event)"
      />
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
            :disabled="builder.locked"
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
</template>

<style lang="sass">

.lowercase
  text-transform: lowercase
.question-content
  border: 1px solid lightgrey
.theme--dark
  .question-content
    border: 1px solid darken(lightgrey, 50)
.question-content.builder
  padding: 0
  margin: 0
</style>
