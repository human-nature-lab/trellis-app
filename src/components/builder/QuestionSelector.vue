<script setup lang="ts">
import { computed } from 'vue'
import { useBuilder } from '@/helpers/injected.helper'
import { useBuilderQuestions } from '@/helpers/builder.helper'
import MenuSelect from '../util/MenuSelect.vue'

const props = defineProps<{
  value?: string
  excludeQuestionIds?: string[]
  disabled?: boolean
}>()

const builder = useBuilder()
const questions = useBuilderQuestions()
const questionsList = computed(() =>
  Object.values(questions.value).filter(q =>
    !props.excludeQuestionIds || !props.excludeQuestionIds.includes(q.id),
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
