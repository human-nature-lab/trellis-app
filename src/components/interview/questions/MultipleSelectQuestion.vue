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
        <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
      </v-checkbox>
      <radio-checkbox
        v-else
        :disabled="isQuestionDisabled"
        v-model="selected[choice.id]"
        @change="onChange(choice, selected[choice.id])">
        <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
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
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  export default {
    props: ['question', 'location'],
    name: 'multiple-select-question',
    mixins: [QuestionDisabledMixin, ActionMixin],
    computed: {
      otherText () {
        return this.question.choices.reduce((agg, choice) => {
          if (choice.parameters && choice.parameters.other) {
            let datum = this.question.datum.data.find(datum => datum.choiceId === choice.id)
            if (datum) {
              agg[choice.id] = datum.val
            }
          }
          return agg
        }, {})
      },
      selected () {
        let selected = this.question.choices.reduce((agg, choice) => {
          agg[choice.id] = this.question.datum.data.findIndex(datum => datum.choiceId === choice.id) > -1
          return agg
        }, {})
        return selected
      }
    },
    methods: {
      onChange: function (choice, val) {
        if (val) {
          this.action(AT.select_choice, {
            choice_id: choice.id,
            val: choice.val
          })
        } else {
          this.action(AT.deselect_choice, {
            choice_id: choice.id,
            val: choice.val
          })
        }
      },
      onOtherChange: function (choice, text) {
        console.log(choice, text)
        this.action(AT.other_choice_text, {
          choice_id: choice.id,
          val: text
        })
      },
      showOtherText: function (choice) {
        return this.selected[choice.id] && choice.parameters && choice.parameters.other
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
