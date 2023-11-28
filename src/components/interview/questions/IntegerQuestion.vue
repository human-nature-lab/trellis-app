<template>
  <v-flex class="integer-question">
    <v-text-field
      :rules="rules"
      :disabled="isQuestionDisabled"
      v-model.number="value"
      type="number"
      :step="stepSize"
      :min="min"
      :max="max" />
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
    name: 'integer-question',
    props: {
      question: {
        type: Question,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, VuetifyValidationRules, ActionMixin],
    data () {
      return {
        _value: null
      }
    },
    setup (props) {
      const stepSize = computed(() => {
        const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.step_size)
        return qp ? +qp.val : 1
      })

      const min = computed(() => {
        const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.min)
        return qp ? +qp.val : null
      })

      const max = computed(() => {
        const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.max)
        return qp ? +qp.val : null
      })
      return { stepSize, min, max }
    },
    computed: {
      value: {
        get () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : this._value
        },
        set (val) {
          this._value = val
          this.debouncedAction(AT.number_change, {
            name: 'integer',
            val: val
          })
        }
      }
    }
  }
</script>
