<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Question from '../../../../entities/trellis/Question'
import { jsonQuestionParameter } from '../../../../lib/json-question-parameter'
import { Config } from '../../../builder/question-builders/DistributionQuestionBuilder.vue'
import CurrencyBin from './CurrencyBin.vue'
import { bins } from '../../../../lib/distribution/bin'
import AT from '../../../../static/action.types'
import { debouncedAction } from '../../lib/action'
import { exitFullscreen, isFullscreen, toggleFullscreen } from '@/helpers/fullscreen.helper'

const props = defineProps<{
  question: Question
  respondent: object
  location: object
}>()

const { config, loading, error } = jsonQuestionParameter<Config>(props.question)
const value = ref(config.value.quantity * config.value.startingPercentage || 0)

watch(() => props.question.datum.data, () => {
  console.log('changing value', props.question.datum.data)
  value.value = props.question.datum.data.length ? +props.question.datum.data[0].val : value.value
}, { immediate: true, deep: true })

const rightPercent = computed(() => {
  return (value.value / config.value.quantity)
})

function storeValue (v: number) {
  debouncedAction(props.question.id, AT.set_val, {
    name: props.question.varName,
    val: v + '',
  })
}

function updateValue (v: number) {
  if (!config.value.useSubmit) {
    storeValue(v)
  }
}

const elem = ref<HTMLElement>()
const locked = ref(false)

function submit () {
  storeValue(value.value)
  locked.value = true
  if (isFullscreen.value) {
    setTimeout(() => {
      exitFullscreen()
    }, 2000)
  }
}

</script>

<template>
  <div
    ref="elem"
    :class="{'fullscreen-container': isFullscreen}"
  >
    <v-col
      class="distribution-question"
      :class="{'fullscreen-question': isFullscreen}"
    >
      <v-row class="no-gutters justify-space-between mx-2">
        <CurrencyBin
          :closed="locked"
          :currency="config.currency"
          :bin="bins[config.bins[0]]"
          :value="(1 - rightPercent) * config.quantity"
        />
        <CurrencyBin
          :closed="locked"
          :currency="config.currency"
          :bin="bins[config.bins[1]]"
          :value="rightPercent * config.quantity"
        />
      </v-row>
      <v-col class="ma-0 pa-0">
        <v-slider
          class="mt-4"
          v-model="value"
          :disabled="locked"
          @change="updateValue"
          :max="config.quantity"
          :step="config.stepSize"
        />
      </v-col>
      <v-row
        v-if="config.useSubmit"
        class="no-gutters justify-center"
      >
        <v-btn
          @click="submit"
          :disabled="locked"
        >
          {{ $t('submit') }}
        </v-btn>
        <v-btn
          v-if="!isFullscreen && !locked"
          @click="toggleFullscreen(elem)"
        >
          fullscreen
        </v-btn>
      </v-row>
    </v-col>
  </div>
</template>

<style lang="sass" scoped>
  .distribution-question
    padding: 0
  .fullscreen-container
    padding-top: 10px
    padding-bottom: 10px
    background-color: white
</style>
