<template>
  <v-card class="question" :question-id="question.id">
    <v-card-title class="primary question-title white--text">
      <v-layout row>
        <v-spacer></v-spacer>
        <v-flex sm6 class="text-xs-right">
          {{question.varName}} : {{question.questionType.name}}
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-alert v-show="validationError" transition="slide-y-transition">
      {{validationError}}
    </v-alert>
    <QuestionTimer v-if="showTimer" :duration="timerDuration" :showControls="showTimerControls"/>
    <v-card-text class="question-content">
      <v-flex class="question-text title">
        <AsyncTranslationText
          :translation="question.questionTranslation"
          :location="location">
        </AsyncTranslationText>
      </v-flex>
      <div
        :is="currentQuestionComponent"
        :question="question"
        :location="location"
        :disabled="disabled"
        :respondent="interview.survey.respondent"></div>
    </v-card-text>
    <v-card-actions v-if="question.type.name !== 'intro'">
      <DontKnowRefused
        :disabled="disabled"
        :question="question" />
    </v-card-actions>
  </v-card>
</template>


<script>
  // This parent component servers the purpose of handling general functionality that is used across all questions.
  // For example, question title and message fills will be applied here. The question header text will be applied here
  // import translationService from '../services/TranslationService'
  import DontKnowRefused from './DontKnowRefused.vue'
  import AsyncTranslationText from '../AsyncTranslationText'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import questionTypes from '../../static/question.types'
  import ParameterType from '../../static/parameter.types'

  import DateQuestion from './questions/DateQuestion'
  import DecimalQuestion from './questions/DecimalQuestion'
  import GeoQuestion from './questions/GeoQuestion'
  import IntegerQuestion from './questions/IntegerQuestion'
  import IntroQuestion from './questions/IntroQuestion'
  import ImageQuestion from './questions/ImageQuestion'
  import MultipleSelectQuestion from './questions/MultipleSelectQuestion'
  import RelationshipQuestion from './questions/RelationshipQuestion'
  import RespondentGeoQuestion from './questions/RespondentGeoQuestion'
  import RosterQuestion from './questions/RosterQuestion'
  import TextQuestion from './questions/TextQuestion'
  import TimeQuestion from './questions/TimeQuestion'
  import QuestionTimer from './QuestionTimer'

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
    [questionTypes.time]: TimeQuestion,
    [questionTypes.image]: ImageQuestion
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
      },
      disabled: {
        type: Boolean,
        required: true
      }
    },
    data () {
      return {
        translation: this.question.questionTranslation,
        hasChanged: false
      }
    },
    update () {
      this.hasChanged = true
    },
    watch: {
      'question': {
        handler () {
          this.hasChanged = true
        },
        deep: true
      },
      location: {
        handler () {
          this.hasChanged = true
        },
        deep: true
      }
    },
    computed: {
      currentQuestionComponent () {
        return typeMap[this.question.questionTypeId]
      },
      validationError () {
        if (!this.hasChanged || (this.question.dkRf !== null && this.question.dkRf !== undefined)) {
          return null
        }
        return this.question.validationError
      },
      timerDuration () {
        if (!this.question || !this.question.questionParameters || !this.question.questionParameters.length) return 0
        const qp = this.question.questionParameters.find(qp => qp.parameterId == ParameterType.allowed_time)
        return qp ? +qp.val : 0
      },
      showTimer () {
        return this.timerDuration !== 0
      },
      showTimerControls () {
        if (!this.question || !this.question.questionParameters || !this.question.questionParameters.length) return true
        const questionParameter = this.question.questionParameters.find(qp => qp.parameterId == ParameterType.show_timer_controls)
        return questionParameter ? !!questionParameter.val : true
      }
    },
    components: {
      AsyncTranslationText,
      QuestionTimer,
      DateQuestion,
      DecimalQuestion,
      DontKnowRefused,
      GeoQuestion,
      IntegerQuestion,
      IntroQuestion,
      ImageQuestion,
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
