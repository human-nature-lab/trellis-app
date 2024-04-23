<script setup lang="ts">
import { onMounted, ref } from 'vue'
import mediaCapture from '@/cordova/media-capture'
import AudioRecorder from '@/components/audio-recorder/AudioRecorder.vue'
import { requestRecording } from '@/components/audio-recorder/recorder'
import { logError } from '@/helpers/log.helper'

const limit = ref(0)
const durationSeconds = ref(30)
const files = ref<MediaFile[]>([])
async function captureImage () {
  const res = await mediaCapture.captureImage({ limit: limit.value })
  console.log(res)
  files.value.push(...res)
}
async function captureVideo () {
  const res = await mediaCapture.captureVideo({ limit: limit.value, duration: durationSeconds.value })
  console.log(res)
  files.value.push(...res)
}
async function captureAudio () {
  const res = await mediaCapture.captureAudio({ limit: limit.value, duration: durationSeconds.value })
  console.log(res)
  files.value.push(...res)
}

async function recordAudio () {
  try {
    const res = await requestRecording()
    console.log(res)
  } catch (err) {
    console.error(err)
    logError(err)
  }
}

const audioModes = ref()
const videoModes = ref()
const imageModes = ref()
onMounted(async () => {
  audioModes.value = await mediaCapture.supportedAudioModes()
  videoModes.value = await mediaCapture.supportedVideoModes()
  imageModes.value = await mediaCapture.supportedImageModes()
})
</script>

<template>
  <v-col>
    <v-row no-gutters>
      <v-text-field
        v-model.number="limit"
        label="Limit"
        type="number"
      />
      <v-text-field
        v-model.number="durationSeconds"
        label="Duration"
        type="number"
      />
    </v-row>
    <v-row no-gutters>
      {{ audioModes }}
    </v-row>
    <v-row no-gutters>
      {{ videoModes }}
    </v-row>
    <v-row no-gutters>
      {{ imageModes }}
    </v-row>
    <v-row no-gutters>
      <v-btn @click="captureImage">
        Capture image
      </v-btn>
    </v-row>
    <v-row no-gutters>
      <v-btn @click="captureVideo">
        Capture video
      </v-btn>
    </v-row>
    <v-row no-gutters>
      <v-btn @click="captureAudio">
        Capture audio
      </v-btn>
    </v-row>
    <v-row no-gutters>
      <v-btn @click="recordAudio">
        Record audio
      </v-btn>
    </v-row>
    <v-list>
      <v-list-item
        v-for="file in files"
        :key="file.fullPath"
      >
        {{ file }}
      </v-list-item>
    </v-list>
    <AudioRecorder />
  </v-col>
</template>

<style lang="sass">

</style>
