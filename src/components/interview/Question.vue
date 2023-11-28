<template>
  <v-card class="question" :question-id="question.id">
    <v-card-title class="primary question-title white--text flex justify-end py-0">
      <v-col cols="12" class="text-right">
        {{question.varName}} : {{question.questionType.name}}
      </v-col>
    </v-card-title>
    <v-alert color="error" v-show="validationError" transition="slide-y-transition">
      {{validationError}}
    </v-alert>
    <QuestionTimer v-if="showTimer" :duration="timerDuration" :showControls="showTimerControls"/>
    <v-card-text class="question-content">
      <v-flex class="question-text title">
        <QuestionText 
          :location="location"
          :question="question"
          :subject="interview.survey.respondent" />
      </v-flex>
      <div
        :is="currentQuestionComponent"
        :question="question"
        :location="location"
        :disabled="disabled || hasDkRf"
        :respondent="interview.survey.respondent"></div>
    </v-card-text>
    <v-card-actions v-if="question.questionType.name !== 'intro' && showDkRf" class="mt-4">
      <DontKnowRefused
        :disabled="disabled"
        :question="question"
      />
    </v-card-actions>
  </v-card>
</template>


<script lang="ts">
  // This parent component servers the purpose of handling general functionality that is used across all questions.
  // For example, question title and message fills will be applied here. The question header text will be applied here
  import { PropOptions } from 'vue'
  import DontKnowRefused from './DontKnowRefused.vue'
  import AsyncTranslationText from '../AsyncTranslationText.vue'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import questionTypes from '../../static/question.types'
  import ParameterType from '../../static/parameter.types'

  import DateQuestion from './questions/DateQuestion.vue'
  import DecimalQuestion from './questions/DecimalQuestion.vue'
  import GeoQuestion from './questions/GeoQuestion.vue'
  import IntegerQuestion from './questions/IntegerQuestion.vue'
  import IntroQuestion from './questions/IntroQuestion.vue'
  import ImageQuestion from './questions/ImageQuestion.vue'
  import MultipleSelectQuestion from './questions/MultipleSelectQuestion.vue'
  import RelationshipQuestion from './questions/RelationshipQuestion.vue'
  import RespondentGeoQuestion from './questions/RespondentGeoQuestion.vue'
  import RosterQuestion from './questions/RosterQuestion.vue'
  import TextQuestion from './questions/TextQuestion.vue'
  import TextAreaQuestion from './questions/TextAreaQuestion.vue'
  import TimeQuestion from './questions/TimeQuestion.vue'
  import DistributionQuestion from './questions/distribution/DistributionQuestion.vue'
  import SocialRingQuestion from './questions/social-ring/SocialRingQuestion.vue'
  import DurationQuestion from './questions/DurationQuestion.vue'
  import QuestionTimer from './QuestionTimer.vue'
  import QuestionText from './QuestionText.vue'
  import Question from '../../entities/trellis/Question'
  import Interview from '../../entities/trellis/Interview'
  import { InterviewLocation } from './services/InterviewAlligator'

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
    [questionTypes.text_area]: TextAreaQuestion,
    [questionTypes.time]: TimeQuestion,
    [questionTypes.image]: ImageQuestion,
    [questionTypes.distribution]: DistributionQuestion,
    [questionTypes.social_ring]: SocialRingQuestion,
    [questionTypes.duration]: DurationQuestion,
  }

  export default Vue.extend({
    name: 'question',
    mixins: [TranslationMixin],
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
      TimeQuestion,
      DistributionQuestion,
      QuestionText,
    },
    props: {
      question: {
        type: Object,
        required: true
      } as PropOptions<Question>,
      interview: {
        type: Object,
        required: true
      } as PropOptions<Interview>,
      location: {
        type: Object,
        required: true
      } as PropOptions<InterviewLocation>,
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
    updated () {
      this.hasChanged = true
    },
    watch: {
      'question': {
        handler () {
          this.hasChanged = true
          this.translation = this.question.questionTranslation
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
      currentQuestionComponent (): string {
        return typeMap[this.question.questionTypeId]
      },
      validationError (): null | Error {
        if (!this.hasChanged || (this.question.dkRf !== null && this.question.dkRf !== undefined)) {
          return null
        }
        return this.question.validationError
      },
      timerDuration (): number {
        if (!this.question || !this.question.questionParameters || !this.question.questionParameters.length) return 0
        const qp = this.question.questionParameters.find(qp => qp.parameterId == ParameterType.allowed_time)
        return qp ? +qp.val : 0
      },
      showTimer (): boolean {
        return this.timerDuration !== 0
      },
      showTimerControls (): boolean {
        if (!this.question || !this.question.questionParameters || !this.question.questionParameters.length) return true
        const questionParameter = this.question.questionParameters.find(qp => qp.parameterId == ParameterType.show_timer_controls)
        return questionParameter ? !!questionParameter.val : true
      },
      showDkRf (): boolean {
        let count = 0
        for (const id of [ParameterType.show_dk, ParameterType.show_rf]) {
          const qp = this.question.questionParameters.find(qp => +qp.parameterId === id)
          if (!qp || !!+qp.val) {
            count++
          }
        }
        return count === 2
      },
      hasDkRf (): boolean {
        return this.question.datum && this.question.datum.dkRf !== null && this.question.datum.dkRf !== undefined
      }
    }
  })
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
