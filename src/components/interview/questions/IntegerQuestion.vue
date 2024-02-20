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
  </v-flex>
</template>

<script lang="ts">
import { computed } from 'vue'
import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
import ActionMixin from '../mixins/ActionMixin'
import AT from '@/static/action.types'
import PT from '@/static/parameter.types'
import Question from '@/entities/trellis/Question'
import { translate, useTranslations } from '@/helpers/translation.helper'
import Translation from '@/entities/trellis/Translation'
import { i18n } from '@/i18n'
import singleton from '@/static/singleton'

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
    const tickLabels = computed(() => {
      if (!isSlider.value) return []
      const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.tick_labels)
      const d = max.value - min.value
      const numSteps = Math.floor(d / stepSize.value)
      if (qp) {
        const labels = JSON.parse(qp.val)
        if (labels.length === 0) return []
        if (labels.length === numSteps) {
          return labels
        }
        const res = []
        const gapSize = Math.floor((d / stepSize.value) / (labels.length - 1))
        // interpolate labels and add nulls for missing labels
        for (let i = 0; i <= numSteps; i++) {
          if (i % (gapSize) === 0) {
            res.push(labels[i / (gapSize)])
          } else {
            res.push(null)
          }
        }
        return res
      }
      const labels = []

      const tickSize = d <= 10 ? 1 : Math.round(d / 10)
      for (let i = min.value; i <= max.value; i++) {
        labels.push((i === min.value || i % tickSize === 0) ? ('' + i) : null)
      }
      return labels
    })
    const { translations, loading } = useTranslations(computed(() => {
      return tickLabels.value.filter(t => !!t).map(t => t.translationId)
    }))
    const translationMap = computed(() => {
      const map: Record<string, Translation> = {}
      translations.value.forEach(t => {
        if (!t) return
        map[t.id] = t as Translation
      })
      return map
    })

    const translatedLabels = computed(() => {
      return tickLabels.value.map(t => {
        if (!t) return null
        if (loading.value) return i18n.t('loading') as string
        return translate(translationMap.value[t.translationId], singleton.locale.id)
      })
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
