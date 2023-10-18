<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FormSelector from '@/components/forms/FormSelector.vue'
import singleton from '@/static/singleton'
import DictatorFollower from './DictatorFollower.vue'
import DictatorLeader from './DictatorLeader.vue'
import FormService from '@/services/form'
import PT from '@/static/parameter.types'
import { useDeviceId, useDeviceName, useServerAddress } from '@/helpers/device.helper'
import { insomnia } from '@/cordova/insomnia'

const formId = ref<string>('')
const { address, loading: loadingAddress, error: addressError } = useServerAddress()
const serviceId = computed(() => {
  return `${address.value}_study-${singleton.study.id}_form-${formId.value}_dictator_async`
})
const { deviceId, loading: loadingDevice, error: deviceError } = useDeviceId()
const { name, loading: loadingName, error: nameError } = useDeviceName()
const role = ref<'leader' | 'follower'>()

const canRunDictator = ref(false)
const working = ref(false)
watch(() => formId.value, async () => {
  if (formId.value) {
    working.value = true
    try {
      canRunDictator.value = await FormService.formHasQuestionsWithParameters(
        formId.value,
        [PT.dictator_decision, PT.dictator_receiver],
      )
    } finally {
      working.value = false
    }
  }
}, { immediate: true })

onMounted(async () => {
  await insomnia.keepAwake()
})

onBeforeUnmount(async () => {
  await insomnia.allowSleep()
})

const canSelectRole = computed(() => {
  return !working.value && formId.value && canRunDictator.value
})

const isReady = computed(() => {
  return !loadingAddress.value || !working.value || !loadingDevice.value
})

function stop () {
  role.value = undefined
}

</script>

<template>
  <v-container v-if="singleton.study">
    <h1>{{ name }}</h1>
    <FormSelector
      v-model="formId"
      :study-id="singleton.study.id"
      :disabled="!!role"
    />
    <v-row v-if="!role">
      <v-col>
        <v-btn
          @click="role = 'leader'"
          :loading="!isReady"
          :disabled="!canSelectRole"
        >
          {{ $t('start_leader') }}
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="role = 'follower'"
          :loading="!isReady"
          :disabled="!canSelectRole"
        >
          {{ $t('follow_leader') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-col>
      <DictatorFollower
        v-if="role === 'follower'"
        :service-id="serviceId"
        :device-id="deviceId"
        :device-name="name"
        @stop="stop"
      />
      <DictatorLeader
        v-else-if="role === 'leader'"
        :service-id="serviceId"
        :device-id="deviceId"
        :form-id="formId"
        :device-name="name"
        @stop="stop"
      />
    </v-col>
  </v-container>
</template>
