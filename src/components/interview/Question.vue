<template>
  <v-card class="question" :question-id="question.id">
    <v-card-title class="primary question-title white--text">
      <v-layout row>
        <v-spacer></v-spacer>
        <v-flex sm6 class="text-xs-right">
          {{question.var_name}} : {{question.type.name}}
        </v-flex>
      </v-layout>
      <!--<v-toolbar>-->
        <!--<v-spacer></v-spacer>-->
        <!--<v-toolbar-title class="white&#45;&#45;text">{{question.var_name}} : {{question.type.name}}</v-toolbar-title>-->
      <!--</v-toolbar>-->
    </v-card-title>
    <v-card-text class="question-content">
      <v-flex class="question-text">
        <InterpolatedText :text="question.text" :section-follow-up-datum-id="location.sectionFollowUpDatumId"/>
      </v-flex>
      <IntroQuestion
        v-if="question.type.name === 'intro'"
        :question="question"/>
      <MultipleSelectQuestion
        v-if="question.type.name === 'multiple_select'"
        :question="question"/>
      <MultipleChoiceQuestion
        v-if="question.type.name === 'multiple_choice'"
        :question="question"/>
      <IntegerQuestion
        v-if="question.type.name === 'integer'"
        :question="question"/>
      <DecimalQuestion
        v-if="question.type.name === 'decimal'"
        :question="question"/>
      <RosterQuestion
        v-if="question.type.name === 'roster'"
        :question="question"/>
      <RelationshipQuestion
        v-if="question.type.name === 'relationship'"
        :question="question"
        :respondent-id="interview.survey.respondent_id"/>
      <TextQuestion
        v-if="question.type.name === 'text'"
        :question="question"/>
      <DateQuestion
        v-if="['date', 'year', 'year_month', 'year_month_day'].indexOf(question.type.name) > -1"
        :question="question"/>
      <TimeQuestion
        v-if="question.type.name === 'time'"
        :question="question"/>
    </v-card-text>
    <v-card-actions v-if="question.type.name !== 'intro'">
      <DontKnowRefused
        :question="question"></DontKnowRefused>
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
  import DecimalQuestion from './questions/DecimalQuestion'
  import IntegerQuestion from './questions/IntegerQuestion'
  import RosterQuestion from './questions/RosterQuestion'
  import RelationshipQuestion from './questions/RelationshipQuestion'
  import TextQuestion from './questions/TextQuestion'
  import TimeQuestion from './questions/TimeQuestion'
  import DateQuestion from './questions/DateQuestion'
  import DontKnowRefused from './DontKnowRefused.vue'

  import InterpolatedText from './InterpolatedText'

  export default {
    name: 'question',
    props: {
      question: {
        type: Object,
        required: true
      },
      interview: {
        type: Object,
        required: true
      },
      location: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        dk_rf: undefined
      }
    },
    components: {
      InterpolatedText,
      IntroQuestion,
      DecimalQuestion,
      IntegerQuestion,
      MultipleSelectQuestion,
      MultipleChoiceQuestion,
      RosterQuestion,
      DontKnowRefused,
      RelationshipQuestion,
      TextQuestion,
      TimeQuestion,
      DateQuestion
    }
  }
</script>

<style lang="sass">
  .question
    label
      text-overflow: inherit
      white-space: normal
      overflow: auto
</style>
