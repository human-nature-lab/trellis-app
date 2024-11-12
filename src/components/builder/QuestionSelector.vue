<script setup lang="ts">
import { computed } from 'vue'
import { useBuilder, useBuilderQuestions } from '@/helpers/builder.helper'
import MenuSelect from '../util/MenuSelect.vue'
import Question from '@/entities/trellis/Question'

const props = defineProps<{
  value?: string
  filter(q: Question): boolean
  disabled?: boolean
}>()

const builder = useBuilder()
const questions = useBuilderQuestions()
const questionsList = computed(() =>
  Object.values(questions.value).filter(q =>
    !props.filter || props.filter(q),
  ),
)
</script>

<template>
  <MenuSelect
    :disabled="props.disabled || builder.locked"
    nullable
    :value="props.value"
    :items="questionsList"
    item-value="id"
    class="ml-2"
    item-text="varName"
    v-on="$listeners"
  >
    <template #selected="{ item: questionId }">
      <slot
        name="selected"
        :question="questions[questionId]"
        :question-id="questionId"
      >
        {{ questionId in questions ? questions[questionId].varName : $t('unknown_question') }}
      </slot>
    </template>
  </MenuSelect>
</template>

<style lang="sass">

</style>
