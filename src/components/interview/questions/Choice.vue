<script lang="ts" setup>
import { computed } from 'vue'
import Question from '@/entities/trellis/Question'
import AT from '@/static/action.types'
import QT from '@/static/question.types'
import { InterviewLocation } from '../services/InterviewAlligator'
import ChoiceText from './ChoiceText.vue'
import RadioCheckbox from './RadioCheckbox.vue'
import { action, debouncedAction } from '../lib/action'
import Choice from '@/entities/trellis/Choice'

export type DisplayChoice = Pick<Choice, 'id' | 'choiceTranslation'> & {
  choice: Choice
  isSelected: boolean
  isOther: boolean
  otherText?: string
}

const props = defineProps<{
  choice: DisplayChoice
  question: Question
  location: InterviewLocation
  disabled: boolean
}>()

const isSelected = computed(() => props.choice.isSelected)

function onChange (displayChoice) {
  if (props.disabled) return
  const choice = displayChoice.choice
  if (!isSelected.value) {
    action(props.question.id, AT.select_choice, {
      choice_id: choice.id,
      val: choice.val,
      name: choice.val,
    })
  } else {
    action(props.question.id, AT.deselect_choice, {
      choice_id: choice.id,
      val: choice.val,
      name: choice.val,
    })
  }
}

function onOtherChange (otherVal) {
  debouncedAction(props.question.id, AT.other_choice_text, {
    choice_id: props.choice.id,
    val: otherVal,
    name: otherVal,
  })
}

function choiceClasses (choice: DisplayChoice) {
  return { other: choice.isOther && choice.isSelected }
}
</script>

<template>
  <v-row class="checkbox-group">
    <v-checkbox
      class="checkbox"
      v-if="question.questionTypeId === QT.multiple_select"
      :disabled="disabled"
      :value="isSelected"
      :class="choiceClasses(choice)"
      @change="onChange(choice)"
    >
      <ChoiceText
        :translation="choice.choiceTranslation"
        :location="location"
        slot="label"
      />
    </v-checkbox>
    <radio-checkbox
      v-else
      :disabled="disabled"
      :value="isSelected"
      :class="choiceClasses(choice)"
      @change="onChange(choice)"
    >
      <ChoiceText
        :translation="choice.choiceTranslation"
        :location="location"
        slot="label"
      />
    </radio-checkbox>
    <v-text-field
      solo
      single-line
      :disabled="disabled"
      :placeholder="$t('other')"
      v-if="choice.isSelected && choice.isOther"
      :value="choice.otherText"
      :autofocus="!choice.otherText || !choice.otherText.length"
      @input="onOtherChange"
    />
  </v-row>
</template>

<style lang="sass">
.input-group
  label
    position: static
    height: auto
    white-space: normal
    display: block
    line-height: 20px
  &.other
    .input-group__details
      display: none
.checkbox-group
  .input-group--text-field
    margin-top: 0
    margin-bottom: 10px
  .checkbox
    margin-top: 0
    .v-messages
      height: 0
      min-height: 0
</style>
