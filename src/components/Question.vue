<template>
  <v-card class="question">
    <v-card-title class="question-title deep-orange white--text">
      <div class="name" :question-id="question.id">Question: {{question.var_name}}</div>
    </v-card-title>
    <v-card-text class="question-content">
      Question here: {{question.var_name}}
      <IntroQuestion v-if="question.question_type.name === 'intro'" :question="transformedQuestion"></IntroQuestion>
      <MultipleSelectQuestion v-if="question.question_type.name === 'multiple_select'" :question="transformedQuestion"/>
      <MultipleChoiceQuestion v-if="question.question_type.name === 'multiple_choice'" :question="transformedQuestion"/>
    </v-card-text>
    <v-card-actions>
      <DontKnowRefused></DontKnowRefused>
    </v-card-actions>
  </v-card>
</template>

<script>
  // This parent component servers the purpose of handling general functionality that is used across all questions.
  // For example, question title and message fills will be applied here. The question header text will be applied here
  import translationService from '../services/TranslationService'
  import IntroQuestion from './questions/IntroQuestion.vue'
  import MultipleSelectQuestion from './questions/MultipleSelectQuestion'
  import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion'
  import DontKnowRefused from './DontKnowRefused.vue'
  export default {
    name: 'question',
    props: ['question'],
    data: function () {
      return {
        dk_rf: undefined
      }
    },
    computed: {
      transformedQuestion: function () {
        switch (this.question.question_type.name) {
          case 'multiple_choice':
          case 'multiple_select':
            for (let choice of this.question.choices) {
              choice.text = translationService.getText(choice.choice_translation)
            }
            this.question.choices.sort((a, b) => {
              return a.pivot.sort_order > b.pivot.sort_order
            })
            break
          default:
            this.question.text = translationService.getText(this.question.question_translation)
        }
        return this.question
      }
    },
    components: {
      IntroQuestion,
      MultipleSelectQuestion,
      MultipleChoiceQuestion,
      DontKnowRefused
    }
  }
</script>

<style scoped>

</style>
