<script setup lang="ts">
import { ref } from 'vue'
import TrellisModal from '@/components/TrellisModal.vue'
import { visible, recording, recorderRef, resolver, rejecter, useAnalyserNode } from './media-recorder'
import { v4 as uuidv4 } from 'uuid'

let media: Media
const mediaSrc = ref('')
const elapsed = ref(0)
const status = ref('stopped')
let intervalId: number

function cleanup () {
  clearInterval(intervalId)
  if (media) {
    if (status.value === 'running') {
      media.stopRecord()
    }
    media.release()
    media = null
  }
}

function reject (err) {
  cleanup()
  if (rejecter.value) {
    rejecter.value(err)
  }
}

function resolve () {
  console.log('resolving', mediaSrc.value)
  cleanup()
  if (resolver.value) {
    resolver.value(mediaSrc.value)
  }
}

function stopRecording () {
  if (media) {
    media.stopRecord()
  }
}

let updateCount = 0
let ampSum = 0
let startTime = 0
const updateWindow = 5
const amplitudes = ref([])
function update () {
  if (!media) return
  media.getCurrentAmplitude(amp => {
    console.log('amp', amp, ampSum)
    ampSum += amp
    updateCount++
    if (updateCount % updateWindow === 0) {
      amplitudes.value.push(ampSum / updateWindow)
      ampSum = 0
    }
    elapsed.value = Date.now() - startTime
  }, err => {
    console.error(err)
  })
}

async function startRecording () {
  amplitudes.value = []
  ampSum = 0
  startTime = Date.now()
  mediaSrc.value = `cdvfile://localhost/temporary/recording-${uuidv4()}.mp3`
  media = new Media(mediaSrc.value, resolve, reject, s => {
    switch (s) {
      case Media.MEDIA_STARTING:
        status.value = 'starting'
        break
      case Media.MEDIA_RUNNING:
        status.value = 'running'
        break
      case Media.MEDIA_STOPPED:
        status.value = 'stopped'
        break
      case Media.MEDIA_PAUSED:
        status.value = 'paused'
        break
    }
  })

  setInterval(update, 1000)

  media.startRecord()
}

async function onClose () {
  cleanup()
  visible.value = false
}
</script>

<template>
  <div ref="recorderRef">
    <TrellisModal
      v-if="visible"
      :title="$t('record_audio')"
      v-model="visible"
      @close="onClose"
      fullscreen
      :persistent="recording"
    >
      {{ status }} ({{ elapsed }}ms)
      <v-row no-gutters>
        <v-btn @click="startRecording">
          Start
        </v-btn>
        <v-btn @click="stopRecording">
          Stop
        </v-btn>
      </v-row>
      <v-col>
        {{ amplitudes }}
      </v-col>
    </TrellisModal>
  </div>
</template>

<style lang="sass">

</style>
