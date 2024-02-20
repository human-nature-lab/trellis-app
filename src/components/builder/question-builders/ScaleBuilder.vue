<script setup lang="ts">
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import { useBuilder } from '@/helpers/builder.helper'
import Translation from '../Translation.vue'
import { ref } from 'vue'
import TranslationIdEditor from '../TranslationIdEditor.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'

export type ScaleConfig = {
  slider: boolean
  min?: number
  max?: number
  stepSize?: number
  choices: { translationId: string }[]
  questions: { value: string, translationId: string }[]
}

const props = defineProps<{
  value: Question,
  locked: boolean,
}>()

const working = ref(false)
const { config, loading, error } = jsonQuestionParameter<ScaleConfig>(props.value, {
  slider: false,
  choices: [],
  questions: [],
})

const builder = useBuilder()

function addChoice () {
  config.value.choices.push({ translationId: null })
}

function addQuestion () {
  config.value.questions.push({ value: '', translationId: null })
}

const panels = ref([0])
</script>

<template>
  <v-container>
    <v-alert
      v-if="error"
      color="error"
    >
      {{ error }}
    </v-alert>
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
    <v-expansion-panels
      v-model="panels"
      multiple
    >
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ $t('choices') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-container>
            <v-row class="no-gutters">
              <v-spacer />
              <v-btn
                :disabled="props.locked"
                @click="addChoice"
                icon
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-row>
            <v-list dense>
              <v-list-item
                v-for="(choice, index) in config.choices"
                :key="index"
                dense
              >
                <!-- <v-list-item-action><span>{{ index + 1 }})</span></v-list-item-action> -->
                <TranslationIdEditor
                  :locale="builder.locale"
                  :locked="builder.locked"
                  v-model="choice.translationId"
                  class="text-body-1 ma-0 pa-0"
                  editable
                />
                <v-list-item-action>
                  <DotsMenu
                    v-if="!builder.locked"
                    removable
                    @remove="config.choices.splice(index, 1)"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ $t('questions') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-container>
            <v-row class="no-gutters">
              <v-spacer />
              <v-btn
                :disabled="props.locked"
                @click="addQuestion"
                icon
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-row>
            <v-list dense>
              <v-list-item
                v-for="(question, index) in config.questions"
                :key="index"
                dense
              >
                <v-col cols="2">
                  <v-text-field
                    v-model="question.value"
                    :disabled="props.locked"
                    :label="$t('value')"
                    dense
                  />
                </v-col>
                <v-col>
                  <TranslationIdEditor
                    :locale="builder.locale"
                    :locked="builder.locked"
                    v-model="question.translationId"
                    class="text-body-1 ma-0 pa-0"
                    editable
                  />
                </v-col>
                <v-list-item-action>
                  <DotsMenu
                    v-if="!builder.locked"
                    removable
                    @remove="config.questions.splice(index, 1)"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-row no-gutters>
      <v-col class="px-2">
        <v-checkbox
          v-model="config.slider"
          :label="$t('show_slider')"
        />
      </v-col>
      <v-col class="px-2">
        <v-text-field
          type="number"
          v-model="config.min"
          :label="$t('min')"
        />
      </v-col>
      <v-col class="px-2">
        <v-text-field
          type="number"
          v-model="config.max"
          :label="$t('max')"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="sass">

</style>
