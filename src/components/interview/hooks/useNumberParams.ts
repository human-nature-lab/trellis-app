import Question from '@/entities/trellis/Question'
import Translation from '@/entities/trellis/Translation'
import { useTranslations, translate } from '@/helpers/translation.helper'
import { i18n } from '@/i18n'
import singleton from '@/static/singleton'
import { Ref, computed } from 'vue'
import PT from '@/static/parameter.types'

export function useNumberParams (question: Ref<Question>, defaultStepSize: number) {
  const stepSize = computed(() => {
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.step_size)
    return qp ? +qp.val : defaultStepSize
  })
  const isSlider = computed(() => {
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.display_slider)
    return qp ? !!+qp.val : false
  })
  const min = computed(() => {
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.min)
    if (qp) {
      return +qp.val
    } else if (isSlider.value) {
      return 0
    } else {
      return null
    }
  })
  const max = computed(() => {
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.max)
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
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.tick_labels)
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
    const qp = question.value.questionParameters.find(qp => +qp.parameterId === PT.initial_value)
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

  return { isSlider, min, max, stepSize, translatedLabels, initialValue }
}
