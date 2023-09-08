<script setup lang="ts">
import { computed, ref } from 'vue'
import config from '@/config'
import FormSelector from '@/components/forms/FormSelector.vue'
import singleton from '@/static/singleton'
const formId = ref<string>()
const serviceId = computed(() => {
  return `${config.apiRoot}_${singleton.study.id}_${formId.value}_dictator_async`
})
const role = ref<'server' | 'client'>()
const formsWithDictator = ref<string[]>([])

const canRunDictator = ref(false) // TODO: check if the selected form has any dictator questions
</script>

<template>
  <v-container v-if="singleton.study">
    <FormSelector
      v-model="formId"
      :study-id="singleton.study.id"
    />
    <v-row>
      <v-col>
        <v-btn
          @click="role = 'server'"
          :disabled="!formId"
        >
          {{ $t('start_server') }}
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="role = 'client'"
          :disabled="!formId"
        >
          {{ $t('join_server') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
