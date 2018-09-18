<template>
  <div class="multiple-select" role="radiogroup">
    <div class="checkbox-group"
         :key="choice.id"
         v-for="choice in choices">
      <v-checkbox
        v-if="question.type.name==='multiple_select'"
        :disabled="isQuestionDisabled"
        v-model="selected[choice.id]"
        :class="choiceClasses(choice)"
        @change="onChange(choice, selected[choice.id])">
        <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
      </v-checkbox>
      <radio-checkbox
        v-else
        :disabled="isQuestionDisabled"
        v-model="selected[choice.id]"
        :class="choiceClasses(choice)"
        @change="onChange(choice, selected[choice.id])">
        <ChoiceText :translation="choice.choiceTranslation" :location="location" slot="label"/>
      </radio-checkbox>
      <v-text-field
        solo
        single-line
        autofocus
        :placeholder="$t('other')"
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
    props: {
      question: {
        type: Object,
        required: true
      },
      location: {
        type: Object,
        required: true
      }
    },
    name: 'multiple-select-question',
    mixins: [QuestionDisabledMixin, ActionMixin],
    computed: {
      otherText () {
        console.log('recalculating other text')
        return this.choices.reduce((agg, choice) => {
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
        console.log('recalculating selected')
        let selected = this.choices.reduce((agg, choice) => {
          agg[choice.id] = this.question.datum.data.findIndex(datum => datum.choiceId === choice.id) > -1
          return agg
        }, {})
        return selected
      },
      choices () {
        console.log('recalculating choices')
        return this.question.choices.map(c => c.choice)
      }
    },
    methods: {
      onChange (choice, val) {
        if (val) {
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
      onOtherChange (choice, text) {
        console.log(choice, text)
        this.action(AT.other_choice_text, {
          choice_id: choice.id,
          val: text,
          name: text
        })
      },
      showOtherText (choice) {
        return this.selected[choice.id] && choice.parameters && choice.parameters.other
      },
      choiceClasses (choice) {
       return { other: this.showOtherText(choice) }
      }
    },
    components: {
      ChoiceText,
      RadioCheckbox
    }
  }
</script>

<style lang="sass">
  .input-group
    label
      line-height: 26px
    &.other
      .input-group__details
        display: none
  .checkbox-group
    .input-group--text-field
      margin-top: 0
      margin-bottom: 10px
</style>
