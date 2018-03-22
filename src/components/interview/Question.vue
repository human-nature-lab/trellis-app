<template>
  <v-card class="question">
    <v-card-title class="question-title deep-orange white--text">
      <v-layout row>
        <v-flex sm10 class="name" :question-id="question.id">
          {{question.text}}
        </v-flex>
        <v-flex sm2 class="text-xs-right">
          {{question.var_name}}
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text class="question-content">

      <IntroQuestion v-if="question.type.name === 'intro'" :question="question"></IntroQuestion>
      <MultipleSelectQuestion v-if="question.type.name === 'multiple_select'" :question="question"/>
      <MultipleChoiceQuestion v-if="question.type.name === 'multiple_choice'" :question="question"/>
    </v-card-text>
    <v-card-actions>
      <DontKnowRefused></DontKnowRefused>
    </v-card-actions>
  </v-card>
</template>

<script>
  // This parent component servers the purpose of handling general functionality that is used across all questions.
  // For example, question title and message fills will be applied here. The question header text will be applied here
  // import translationService from '../services/TranslationService'
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
    methods: {

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
