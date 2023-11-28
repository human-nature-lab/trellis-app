<script setup lang="ts">
import { computed, ref } from 'vue'
import QT from '@/static/question.types'
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import TranslationIdEditor from '../TranslationIdEditor.vue'
import { useBuilder } from '@/helpers/builder.helper'
import EditText from '@/components/util/EditText.vue'
import QuestionSelector from '../QuestionSelector.vue'
import SocialRingDisplay, { Ring, SocialRingConfig } from '@/components/interview/questions/social-ring/SocialRingDisplay.vue'

const builder = useBuilder()
const props = defineProps<{
  value: Question
  locked: boolean
}>()

const { config, loading, error } = jsonQuestionParameter<SocialRingConfig>(props.value, {
  rings: [],
  hideAfterMove: false,
  showRingVarName: true,
  allowFinalReview: false,
})

function addRing () {
  config.value.rings.push({
    varName: '' + (config.value.rings.length + 1),
    labelTranslationId: null,
  })
}

const tab = ref(0)
const numDemoRespondents = ref(20)
const demoRespondents = computed(() => {
  const respondents = []
  for (let i = 0; i < numDemoRespondents.value; i++) {
    const men = Math.random() < 0.5
    respondents.push({
      id: '' + (i + 1),
      name: `Respondent ${i + 1}`,
      avatarSrc: `https://randomuser.me/api/portraits/${men ? 'men' : 'women'}/${i + 1}.jpg`,
    })
  }
  return respondents
})
const egoRespondentImage = ref(numDemoRespondents.value + 1)
const egoDemoRespondent = computed(() => {
  const men = Math.random() < 0.5
  return {
    id: '0',
    name: 'Ego respondent',
    avatarSrc: `https://randomuser.me/api/portraits/${men ? 'men' : 'women'}/${egoRespondentImage.value}.jpg`,
  }
})
const demoRings = ref<Record<string, string | number>>({})
function updateRings (respondentId: string, ring: Ring) {
  demoRings.value[respondentId] = ring.varName
  demoRings.value = { ...demoRings.value }
}
</script>

<template>
  <v-col class="pa-0">
    <v-tabs
      v-model="tab"
      background-color="transparent"
      color="basil"
      grow
    >
      <v-tab>
        {{ $t('builder') }}
      </v-tab>
      <v-tab>
        {{ $t('preview') }}
      </v-tab>
    </v-tabs>

    <v-tabs-items
      v-model="tab"
      class="pa-0"
    >
      <v-tab-item>
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
        <v-container>
          <v-row class="no-gutters">
            <h3>{{ $t('rings') }}</h3>
            <v-spacer />
            <v-btn
              v-if="!props.locked"
              @click="addRing"
              icon
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-row>
          <v-list>
            <v-list-item
              v-for="ring in config.rings"
              :key="ring.varName"
            >
              <v-list-item-action-text>
                <EditText
                  tag="span"
                  v-model="ring.varName"
                  :disabled="props.locked"
                  editable
                />
                <span>:</span>
              </v-list-item-action-text>
              <v-list-item-content>
                <TranslationIdEditor
                  v-model="ring.labelTranslationId"
                  :locale="builder.locale"
                  :locked="props.locked"
                  autogrow
                  editable
                  textarea
                />
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-col>
            <h4>{{ $t('ring_respondents_source') }}</h4>
            <QuestionSelector
              v-model="config.sourceQuestionId"
              :filter="q => q.id === props.value.id || q.questionTypeId === QT.relationship"
            >
              <template #selected="{ question }">
                {{
                  question ?
                    $t('follow_up_to', [question ? question.varName : $t('unknown_question')]) :
                    $t('no_follow_up')
                }}
              </template>
            </QuestionSelector>
            <!-- TODO: Include other sources of respondents? -->
          </v-col>
          <v-col>
            <h4>{{ $t('configuration') }}</h4>
            <v-row class="no-gutters justify-space-between">
              <v-switch
                v-model="config.allowFinalReview"
                :label="$t('ring_allow_final_review')"
                :readonly="props.locked"
              />
              <v-switch
                v-model="config.hideAfterMove"
                :label="$t('ring_hide_after_move')"
                :readonly="props.locked"
              />
              <v-switch
                v-model="config.showRingVarName"
                :label="$t('ring_show_var_name')"
                :readonly="props.locked"
              />
            </v-row>
          </v-col>
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <SocialRingDisplay
          v-if="tab === 1"
          :value="demoRings"
          @change-ring="updateRings"
          :config="config"
          :respondents="demoRespondents"
          :ego="egoDemoRespondent"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-col>
</template>

<style lang="sass">

</style>
