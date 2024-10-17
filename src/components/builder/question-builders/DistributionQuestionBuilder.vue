<script setup lang="ts">
import Translation from '../Translation.vue'
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import { bins } from '@/lib/distribution/bin'
import { numberTransformer } from '@/lib/number-transformer'
import { useBuilder } from '@/helpers/builder.helper'

export type Config = {
  type: 'currency'
  currency: 'hnl' | 'usd'
  useSubmit: boolean
  quantity: number
  stepSize: number
  startingPercentage: number
  bins: (keyof typeof bins)[]
}

const props = defineProps<{
  value: Question,
  locked: boolean,
}>()

const { config, loading, error } = jsonQuestionParameter<Config>(props.value, {
  quantity: 10,
  stepSize: 1,
  useSubmit: false,
  startingPercentage: 0.50,
  type: 'currency',
  currency: 'hnl',
  bins: ['envelope', 'wallet'],
})

const builder = useBuilder()

const quantity = numberTransformer(config, 'quantity')
const stepSize = numberTransformer(config, 'stepSize')
const startingPercentage = numberTransformer(config, 'startingPercentage')

</script>

<template>
  <v-container>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <Translation
      :locale="builder.locale"
      :locked="builder.locked"
      v-model="props.value.questionTranslation"
      class="text-body-1"
      autogrow
      editable
      textarea
    />
    <v-row class="no-gutters mt-6">
      <h4>{{ $t('configuration') }}</h4>
    </v-row>
    <v-row class="no-gutters">
      <v-col
        class="px-1"
        cols="6"
      >
        <v-text-field
          v-model="quantity"
          type="number"
          :readonly="props.locked"
          :label="$t('distribution_quantity')"
        />
      </v-col>
      <v-col
        class="px-1"
        cols="6"
      >
        <v-text-field
          v-model="stepSize"
          :readonly="props.locked"
          type="number"
          :label="$t('distribution_step_size')"
        />
      </v-col>
    </v-row>
    <v-row class="no-gutters">
      <v-col
        class="px-1"
        cols="6"
      >
        <v-select
          v-model="config.currency"
          :readonly="props.locked"
          :items="['hnl', 'usd']"
          :label="$t('currency')"
        />
      </v-col>
      <v-col
        class="px-1"
        cols="6"
      >
        <v-text-field
          v-model="startingPercentage"
          :readonly="props.locked"
          type="number"
          :step="0.01"
          :label="$t('distribution_starting_percentage')"
        />
      </v-col>
    </v-row>
    <v-row class="no-gutters">
      <v-col
        class="px-1"
      >
        Left
        <v-select
          v-model="config.bins[0]"
          :readonly="props.locked"
          :label="$t('distribution_bin_type')"
          :items="Object.keys(bins)"
        />
        <img
          :src="bins[config.bins[0]].displayImageSrc"
          :alt="`photo of a distribution bin with name '${config.bins[0]}'`"
        >
      </v-col>
      <v-col
        class="px-1"
      >
        Right
        <v-select
          v-model="config.bins[1]"
          :readonly="props.locked"
          :label="$t('distribution_bin_type')"
          :items="Object.keys(bins)"
        />
        <img
          :src="bins[config.bins[1]].displayImageSrc"
          :alt="`photo of a distribution bin with name '${config.bins[1]}'`"
        >
      </v-col>
      <v-col class="px-1">
        <v-switch
          v-model="config.useSubmit"
          :readonly="props.locked"
          :label="$t('distribution_use_submit')"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="sass">
  .bin
    img
      max-height: 100px
</style>
