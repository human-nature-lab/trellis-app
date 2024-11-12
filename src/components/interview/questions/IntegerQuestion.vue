<template>
  <v-col class="integer-question">
    <QuestionText
      :question="question"
      :location="location"
    />
    <v-slider
      v-if="isSlider"
      class="mt-6"
      :rules="rules"
      :disabled="isQuestionDisabled"
      v-model.number="value"
      :step="stepSize"
      :min="min"
      :max="max"
      :tick-labels="translatedLabels"
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
  </v-col>
</template>

<script lang="ts">
import { computed } from 'vue'
import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
import ActionMixin from '../mixins/ActionMixin'
import AT from '@/static/action.types'
import Question from '@/entities/trellis/Question'
import { useNumberParams } from '../hooks/useNumberParams'
import QuestionText from '../QuestionText.vue'

export default {
  name: 'IntegerQuestion',
  components: { QuestionText },
  props: {
    question: {
      type: Question,
      required: true,
    },
    location: {
      type: Object,
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
    const { stepSize, min, max, isSlider, translatedLabels, initialValue } = useNumberParams(computed(() => props.question), 1)
    return { stepSize, min, max, initialValue, isSlider, translatedLabels }
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
