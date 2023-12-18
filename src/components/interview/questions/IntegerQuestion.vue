<template>
  <v-flex class="integer-question">
    <v-slider
      v-if="isSlider"
      class="mt-6"
      :rules="rules"
      :disabled="isQuestionDisabled"
      v-model.number="value"
      :step="stepSize"
      :min="min"
      :max="max"
      thumb-label="always"
    />
    <v-text-field
      v-else
      :rules="rules"
      :disabled="isQuestionDisabled"
      v-model.number="value"
      type="number"
      :step="stepSize"
      :min="min"
      :max="max"
    />
  </v-flex>
</template>

<script>
import { computed } from 'vue'
import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
import ActionMixin from '../mixins/ActionMixin'
import AT from '@/static/action.types'
import PT from '@/static/parameter.types'
import Question from '@/entities/trellis/Question'
export default {
  name: 'IntegerQuestion',
  props: {
    question: {
      type: Question,
      required: true,
    },
  },
  mixins: [QuestionDisabledMixin, VuetifyValidationRules, ActionMixin],
  data () {
    return {
      _value: null,
    }
  },
  setup (props) {
    const stepSize = computed(() => {
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.step_size)
      return qp ? +qp.val : 1
    })
    const isSlider = computed(() => {
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.display_slider)
      return qp ? !!+qp.val : false
    })
    const min = computed(() => {
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.min)
      if (qp) {
        return +qp.val
      } else if (isSlider.value) {
        return 0
      } else {
        return null
      }
    })
    const max = computed(() => {
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.max)
      if (qp) {
        return +qp.val
      } else if (isSlider.value) {
        return 100
      } else {
        return null
      }
    })
    const initialValue = computed(() => {
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.initial_value)
      if (qp) {
        return +qp.val
      } else if (isSlider.value) {
        const midpoint = (max.value - min.value) / 2
        // round to nearest step size
        return Math.round(midpoint / stepSize.value) * stepSize.value
      } else {
        return null
      }
    })
    return { stepSize, min, max, initialValue, isSlider }
  },
  computed: {
    value: {
      get () {
        if (this.question.datum.data.length) {
          return +this.question.datum.data[0].val
        } else if (!this._value && this.initialValue) {
          return +this.initialValue
        } else {
          return this._value
        }
      },
      set (val) {
        this._value = val
        this.debouncedAction(AT.number_change, {
          name: 'integer',
          val: val,
        })
      },
    },
  },
}
</script>
