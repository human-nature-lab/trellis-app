<template>
  <div class="multiple-choice">
    <v-checkbox
      :disabled="isQuestionDisabled"
      v-for="choice in question.choices"
      :key="choice.val"
      v-model="selected[choice.id]"
      @change="onChange(choice, selected[choice.id])">
      <ChoiceText :translation="choice.choice_translation" slot="label"/>
    </v-checkbox>
  </div>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ChoiceText from './ChoiceText'
  import actionBus from '../services/ActionBus'
  export default {
    props: ['question'],
    name: 'multiple-choice-question',
    mixins: [QuestionDisabledMixin],
    computed: {
      selected: function () {
        let selected = this.question.choices.reduce((agg, choice) => {
          agg[choice.id] = this.question.datum.data.findIndex(datum => datum.choice_id === choice.id) > -1
          return agg
        }, {})
        console.log('selected multiple choice', selected)
        return selected
      }
    },
    methods: {
      onChange: function (choice, val) {
        if (val) {
          actionBus.action({
            action_type: 'select-choice',
            question_datum_id: this.question.datum.id,
            payload: {
              choice_id: choice.id,
              val: choice.val
            }
          })
        } else {
          actionBus.action({
            action_type: 'deselect-choice',
            question_datum_id: this.question.datum.id,
            payload: {
              choice_id: choice.id,
              val: choice.val
            }
          })
        }
      }
    },
    components: {
      ChoiceText
    }
  }
</script>

<style scoped>
  /* TODO: Need to style the checkboxes to look like radio buttons instead. We have to use checkboxes because the state
   of a radio button in HTML cannot be set to false. This means the radio buttons can't be deselected programmatically
   without recreating the element.*/
</style>
