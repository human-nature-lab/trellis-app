<template>
  <div class="checkbox-group">
    <v-checkbox
      v-if="question.type.name==='multiple_select'"
      :disabled="disabled"
      v-model="choice.isSelected"
      :class="choiceClasses(choice)"
      @change="onChange(choice)">
      <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
    </v-checkbox>
    <radio-checkbox
      v-else
      :disabled="disabled"
      v-model="choice.isSelected"
      :class="choiceClasses(choice)"
      @change="onChange(choice)">
      <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
    </radio-checkbox>
    <v-text-field
      solo
      single-line
      :disabled="disabled"
      :placeholder="$t('other')"
      v-if="choice.isSelected && choice.isOther"
      :value="choice.otherText"
      :autofocus="!choice.otherText || !choice.otherText.length"
      @input="onOtherChange"/>
  </div>
</template>

<script>
  import AT from '../../../static/action.types'
  import ActionMixin from '../mixins/ActionMixin'
  import ChoiceText from './ChoiceText'
  import RadioCheckbox from './RadioCheckbox'

  export default {
    name: 'choice',
    props: {
      choice: Object,
      question: Object,
      location: Object,
      disabled: Boolean
    },
    methods: {
      onChange (displayChoice) {
        const choice = displayChoice.choice
        if (displayChoice.isSelected) {
          this.action(AT.select_choice, {
            choice_id: choice.id,
            val: choice.val,
            name: choice.val
          })
        } else {
          this.action(AT.deselect_choice, {
            choice_id: choice.id,
            val: choice.val,
            name: choice.val
          })
        }
      },
      onOtherChange (otherVal) {
        console.log('other change', otherVal)
        this.debouncedAction(AT.other_choice_text, {
          choice_id: this.choice.id,
          val: otherVal,
          name: otherVal
        })
      },
      choiceClasses (choice) {
        return { other: choice.isOther && choice.isSelected }
      }
    },
    mixins: [ActionMixin],
    components: {
      ChoiceText,
      RadioCheckbox
    }
  }
</script>

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
</style>
