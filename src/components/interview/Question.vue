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
    <v-alert v-show="validationError" transition="slide-y-transition">
      {{validationError}}
    </v-alert>
    <v-card-text class="question-content">
      <v-flex class="question-text title">
        <InterpolatedText
          :text="translated"
          :location="location" />
      </v-flex>
      <component
        :is="typeMap[question.question_type_id]"
        :question="question"
        :location="location"
        :respondent="interview.survey.respondent"></component>
    </v-card-text>
    <v-card-actions v-if="question.type.name !== 'intro'">
      <DontKnowRefused
        :question="question" />
    </v-card-actions>
  </v-card>
</template>


<script>
  // This parent component servers the purpose of handling general functionality that is used across all questions.
  // For example, question title and message fills will be applied here. The question header text will be applied here
  // import translationService from '../services/TranslationService'
  import DontKnowRefused from './DontKnowRefused.vue'
  import InterpolatedText from './InterpolatedText'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import questionTypes from '../../static/question.types'

  import DateQuestion from './questions/DateQuestion'
  import DecimalQuestion from './questions/DecimalQuestion'
  import GeoQuestion from './questions/GeoQuestion'
  import IntegerQuestion from './questions/IntegerQuestion'
  import IntroQuestion from './questions/IntroQuestion.vue'
  import MultipleSelectQuestion from './questions/MultipleSelectQuestion'
  import RelationshipQuestion from './questions/RelationshipQuestion'
  import RespondentGeoQuestion from './questions/RespondentGeoQuestion'
  import RosterQuestion from './questions/RosterQuestion'
  import TextQuestion from './questions/TextQuestion'
  import TimeQuestion from './questions/TimeQuestion'

  const typeMap = {
    [questionTypes.year]: DateQuestion,
    [questionTypes.year_month]: DateQuestion,
    [questionTypes.year_month_day]: DateQuestion,
    [questionTypes.year_month_day_time]: DateQuestion,
    [questionTypes.decimal]: DecimalQuestion,
    [questionTypes.geo]: GeoQuestion,
    [questionTypes.integer]: IntegerQuestion,
    [questionTypes.intro]: IntroQuestion,
    [questionTypes.multiple_select]: MultipleSelectQuestion,
    [questionTypes.multiple_choice]: MultipleSelectQuestion,
    [questionTypes.relationship]: RelationshipQuestion,
    [questionTypes.respondent_geo]: RespondentGeoQuestion,
    [questionTypes.roster]: RosterQuestion,
    [questionTypes.text]: TextQuestion,
    [questionTypes.text_area]: TextQuestion,
    [questionTypes.time]: TimeQuestion
  }

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
        typeMap: typeMap,
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
      RespondentGeoQuestion,
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
