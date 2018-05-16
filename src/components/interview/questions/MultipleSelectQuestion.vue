<template>
  <div class="multiple-select" role="radiogroup">
    <div class="checkbox-group"
         :key="choice.id"
         v-for="choice in question.choices">
      <v-checkbox
        v-if="question.type.name==='multiple_select'"
        :disabled="isQuestionDisabled"
        v-model="selected[choice.id]"
        @change="onChange(choice, selected[choice.id])">
        <ChoiceText :translation="choice.choice_translation" slot="label"/>
      </v-checkbox>
      <radio-checkbox
        v-else
        :disabled="isQuestionDisabled"
        v-model="selected[choice.id]"
        @change="onChange(choice, selected[choice.id])">
        <ChoiceText :translation="choice.choice_translation" slot="label"/>
      </radio-checkbox>
      <v-text-field
        v-if="showOtherText(choice)"
        v-model="otherText[choice.id]"
        @change="onOtherChange(choice, otherText[choice.id])"/>
    </div>
  </div>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ChoiceText from './ChoiceText'
  import RadioCheckbox from './RadioCheckbox'
  import actionBus from '../services/ActionBus'
  export default {
    props: ['question'],
    name: 'multiple-select-question',
    mixins: [QuestionDisabledMixin],
    computed: {
      otherText: function () {
        return this.question.choices.reduce((agg, choice) => {
          if (choice.parameters && (choice.parameters.other || choice.parameters.other_exclusive)) {
            let datum = this.question.datum.data.find(datum => datum.choice_id === choice.id)
            if (datum) {
              agg[choice.id] = datum.val
            }
          }
          return agg
        }, {})
      },
      selected: function () {
        let selected = this.question.choices.reduce((agg, choice) => {
          agg[choice.id] = this.question.datum.data.findIndex(datum => datum.choice_id === choice.id) > -1
          return agg
        }, {})
        console.log('selected multiple select', selected)
        return selected
      }
    },
    methods: {
      onChange: function (choice, val) {
        if (val) {
          actionBus.action({
            action_type: 'select-choice',
            question_id: this.question.id,
            payload: {
              choice_id: choice.id,
              val: choice.val
            }
          })
        } else {
          actionBus.action({
            action_type: 'deselect-choice',
            question_id: this.question.id,
            payload: {
              choice_id: choice.id,
              val: choice.val
            }
          })
        }
      },
      onOtherChange: function (choice, text) {
        console.log(choice, text)
        actionBus.actionDebounce({
          action_type: 'other-choice-text',
          question_id: this.question.id,
          payload: {
            choice_id: choice.id,
            val: text
          }
        })
      },
      showOtherText: function (choice) {
        return this.selected[choice.id] && choice.parameters && (choice.parameters.other || choice.parameters.other_exclusive)
      }
    },
    components: {
      ChoiceText,
      RadioCheckbox
    }
  }
</script>

<style lang="sass">
  .input-group label
    line-height: 26px
</style>
