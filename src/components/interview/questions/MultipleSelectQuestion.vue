<template>
  <div class="multiple-select" role="radiogroup">
    <Choice
      :choice="displayChoice"
      :question="question"
      :location="location"
      :disabled="isQuestionDisabled"
      v-for="displayChoice in displayChoices" />
  </div>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import PT from '../../../static/parameter.types'
  import Choice from './Choice'
  export default {
    components: {Choice},
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
    mixins: [QuestionDisabledMixin],
    data () {
      return {
        otherValsSet_: new Set()
      }
    },
    computed: {
      otherChoiceVals () {
        this.otherValsSet_.clear()
        for (let i = 0; i < this.question.questionParameters.length; i++) {
          if (parseInt(this.question.questionParameters[i].parameterId, 10) === PT.other) {
            this.otherValsSet_.add(this.question.questionParameters[i].val)
          }
        }
        return this.otherValsSet_
      },
      displayChoices () {
        return this.choices.map(choice => {
          const datum = this.question.datum.data.find(d => d.choiceId === choice.id)
          return {
            id: choice.id,
            choice: choice,
            choiceTranslation: choice.choiceTranslation,
            isSelected: !!datum,
            isOther: this.otherChoiceVals.has(choice.val),
            otherText: datum && this.otherChoiceVals.has(choice.val) ? datum.val : null
          }
        })
      },
      choices () {
        return this.question.choices.map(c => c.choice)
      }
    }
  }
</script>
