<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import config from '@/config'
import FormSelector from '@/components/forms/FormSelector.vue'
import singleton from '@/static/singleton'
import DictatorClient from './DictatorClient.vue'
import DictatorServer from './DictatorServer.vue'
import FormService from '@/services/form'
import PT from '@/static/parameter.types'

const formId = ref<string>()
const serviceId = computed(() => {
  return `${config.apiRoot}_${singleton.study.id}_${formId.value}_dictator_async`
})
const role = ref<'server' | 'client'>()

const canRunDictator = ref(false)
const working = ref(false)
watch(() => formId.value, async () => {
  if (formId.value) {
    working.value = true
    try {
      canRunDictator.value = await FormService.formHasQuestionsWithParameters(formId.value, [PT.dictator_decision, PT.dictator_receiver])
    } finally {
      working.value = false
    }
  }
}, { immediate: true })

const canSelectRole = computed(() => {
  return !working.value && formId.value && canRunDictator.value
})

</script>

<template>
  <v-container v-if="singleton.study">
    <FormSelector
      v-model="formId"
      :study-id="singleton.study.id"
    />
    <v-row v-if="!role">
      <v-col>
        <v-btn
          @click="role = 'server'"
          :loading="working"
          :disabled="!canSelectRole"
        >
          {{ $t('start_server') }}
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="role = 'client'"
          :loading="working"
          :disabled="!canSelectRole"
        >
          {{ $t('join_server') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-col>
      <DictatorClient v-if="role === 'client'" />
      <DictatorServer v-else-if="role === 'server'" />
    </v-col>
  </v-container>
</template>
