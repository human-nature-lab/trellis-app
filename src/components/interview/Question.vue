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
    <v-alert v-show="validationError">
      {{validationError}}
    </v-alert>
    <v-card-text class="question-content">
      <v-flex class="question-text title">
        <InterpolatedText
          :text="translated"
          :location="location" />
      </v-flex>
      <IntroQuestion
        v-if="question.type.name === 'intro'"
        :question="question"/>
      <MultipleSelectQuestion
        v-else-if="question.type.name === 'multiple_select' || question.type.name === 'multiple_choice'"
        :location="location"
        :question="question"/>
      <IntegerQuestion
        v-else-if="question.type.name === 'integer'"
        :question="question"/>
      <DecimalQuestion
        v-else-if="question.type.name === 'decimal'"
        :question="question"/>
      <RosterQuestion
        v-else-if="question.type.name === 'roster'"
        :question="question"/>
      <RelationshipQuestion
        v-else-if="question.type.name === 'relationship'"
        :question="question"
        :respondent="interview.survey.respondent"/>
      <TextQuestion
        v-else-if="question.type.name === 'text' || question.type.name === 'text_area'"
        :question="question"/>
      <DateQuestion
        v-else-if="['date', 'year', 'year_month', 'year_month_day'].indexOf(question.type.name) > -1"
        :question="question"/>
      <TimeQuestion
        v-else-if="question.type.name === 'time'"
        :question="question"/>
      <GeoQuestion
        v-else-if="question.type.name === 'geo'"
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
  import DateQuestion from './questions/DateQuestion'
  import DecimalQuestion from './questions/DecimalQuestion'
  import DontKnowRefused from './DontKnowRefused.vue'
  import GeoQuestion from './questions/GeoQuestion'
  import IntegerQuestion from './questions/IntegerQuestion'
  import InterpolatedText from './InterpolatedText'
  import IntroQuestion from './questions/IntroQuestion.vue'
  import MultipleSelectQuestion from './questions/MultipleSelectQuestion'
  import RelationshipQuestion from './questions/RelationshipQuestion'
  import RosterQuestion from './questions/RosterQuestion'
  import TextQuestion from './questions/TextQuestion'
  import TimeQuestion from './questions/TimeQuestion'

  import TranslationMixin from '../../mixins/TranslationMixin'

  export default {
    name: 'question',
    mixins: [TranslationMixin],
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
        translation: this.question.question_translation,
        hasChanged: false
      }
    },
    updated: function () {
      if (!this.hasChanged) {
        this.hasChanged = true
      }
    },
    computed: {
      validationError: function () {
        if (!this.hasChanged || (this.question.dk_rf !== null && this.question.dk_rf !== undefined)) {
          return null
        }
        return this.question.validationError
      }
    },
    components: {
      DateQuestion,
      DecimalQuestion,
      DontKnowRefused,
      GeoQuestion,
      InterpolatedText,
      IntegerQuestion,
      IntroQuestion,
      MultipleSelectQuestion,
      RelationshipQuestion,
      RosterQuestion,
      TextQuestion,
      TimeQuestion
    }
  }
</script>

<style lang="sass">
  $question-margin: 15px
  .question
    margin-top: $question-margin
    margin-bottom: $question-margin
    .question-text
      padding-bottom: 15px
  .input-group
    &.input-group--selection-controls
      label
        /*text-overflow: inherit*/
        /*white-space: normal*/
        /*overflow: auto*/
        max-width: 95%
        /*height: auto*/
</style>
