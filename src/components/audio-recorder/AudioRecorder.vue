<script setup lang="ts">
import { ref, watch } from 'vue'
import TrellisModal from '@/components/TrellisModal.vue'
import { active, recorderRef, resolver, rejecter } from './recorder'
const state = ref()

function reject(err: Error) {
  if (rejecter.value) {
    rejecter.value(err)
  }
}

let recorder: MediaRecorder | null = null
let chunks: Blob[] = []

watch(active, async (value) => {
  if (value) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        debugger
        throw new Error('Media devices not supported')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks = []
      recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      recorder.ondataavailable = e => {
        chunks.push(e.data)
      }
      recorder.onerror = e => {
        debugger
        reject(new Error(e.error))
        state.value = recorder.state
      }
    } catch (err) {
      debugger
      console.error(err)
      reject(err)
    }
  }
}, { immediate: true })

function startRecording () {
  if (active.value) {
    return
  }
  active.value = true
  recorder.start()
  state.value = recorder.state
}

function stopRecording () {
  if (!active.value) {
    return
  }
  active.value = false
  recorder.stop()
  state.value = recorder.state
  resolver.value(new File(chunks, 'recording.webm', { type: 'audio/webm' }))
}
</script>

<template>
  <TrellisModal
    :title="$t('record_audio')"
    v-model="active"
    fullscreen
    ref="recorderRef"
  >
    <v-col v-if="active">
      <v-row no-gutters>
        <v-btn @click="startRecording">
          <v-icon>mdi-record</v-icon>
        </v-btn>
      </v-row>
    </v-col>
  </TrellisModal>
</template>

<style lang="sass">

</style>
