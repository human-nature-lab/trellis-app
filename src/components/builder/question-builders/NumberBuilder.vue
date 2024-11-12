<script setup lang="ts">
import Question from '@/entities/trellis/Question'
import Translation from '../Translation.vue'
import { useBuilder } from '@/helpers/builder.helper'
import { BooleanSerializer, JSONSerializer, NumberSerializer, useJsonQuestionParameter, useQuestionParameter } from '@/helpers/parameter.helper'
import { computed } from 'vue'
import PT from '@/static/parameter.types'
import TranslationIdEditor from '../TranslationIdEditor.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'

const props = defineProps<{
  value: Question,
  locked: boolean,
}>()

type MinTranslation = {
  translationId: string
}

const builder = useBuilder()

const {
  val: max,
  loading: loadingMax,
  error: errorMax,
} = useQuestionParameter(props.value, PT.max, null, NumberSerializer, true)
const {
  val: min,
  loading: loadingMin,
  error: errorMin,
} = useQuestionParameter(props.value, PT.min, null, NumberSerializer, true)
const {
  val: displaySlider,
  loading: loadingDisplaySlider,
  error: errorDisplaySlider,
} = useQuestionParameter<boolean>(props.value, PT.display_slider, false, BooleanSerializer, true)
const {
  val: labels,
  loading: loadingLabels,
  error: errorLabels,
} = useQuestionParameter<MinTranslation[]>(props.value, PT.tick_labels, [], JSONSerializer, true)

const loading = computed(() => loadingMax.value || loadingMin.value || loadingDisplaySlider.value || loadingLabels.value)
const error = computed(() => errorMax.value || errorMin.value || errorDisplaySlider.value || errorLabels.value)

function addLabel () {
  labels.value.push({ translationId: null })
}

defineExpose({ hiddenParameters: [PT.min, PT.max, PT.display_slider, PT.tick_labels] })
</script>

<template>
  <v-container>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-alert
      v-if="error"
      color="error"
    >
      {{ error }}
    </v-alert>
    <Translation
      :locale="builder.locale"
      :locked="builder.locked"
      v-model="props.value.questionTranslation"
      class="text-body-1"
      autogrow
      editable
      textarea
    />
    <v-expansion-panels flat>
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ $t('configuration') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-container>
            <v-row no-gutters>
              <v-col class="px-2">
                <v-checkbox
                  v-model="displaySlider"
                  :readonly="builder.locked"
                  :label="$t('show_as_slider')"
                />
              </v-col>
              <v-col class="px-2">
                <v-text-field
                  v-model.number="min"
                  :readonly="builder.locked"
                  :label="$t('min')"
                  type="number"
                />
              </v-col>
              <v-col class="px-2">
                <v-text-field
                  v-model.number="max"
                  :readonly="builder.locked"
                  :label="$t('max')"
                  type="number"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-container v-if="displaySlider">
      <v-row no-gutters>
        <h3>{{ $t('labels') }}</h3>
        <v-spacer />
        <v-btn
          icon
          text
          :disabled="builder.locked || loading"
          @click="addLabel"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-row>
      <v-list>
        <v-list-item
          v-for="label, index of labels"
          :key="index"
        >
          <TranslationIdEditor
            v-model="label.translationId"
            :locale="builder.locale"
            :locked="builder.locked"
            autogrow
            editable
          />
          <DotsMenu
            v-if="!builder.locked"
            removable
            @remove="labels.splice(index, 1)"
          />
        </v-list-item>
      </v-list>
    </v-container>
  </v-container>
</template>

<style lang="sass">

</style>
