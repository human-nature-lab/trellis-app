<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import TrellisModal from '@/components/TrellisModal.vue'
import { visible, recording, recorderRef, resolver, rejecter } from './media-recorder'
import { v4 as uuidv4 } from 'uuid'
import { formatDuration } from '@/filters/format-duration'
import singleton from '@/static/singleton'

let media: Media
const mediaSrc = ref('')
const elapsed = ref(0)
const status = ref('stopped')
let intervalId: number
const amplitudeWindowSize = 5
const updateInterval = 100
const width = 400
const height = 200
const barWidth = 5
const amplitudes = new Uint8Array((width / barWidth) + 1)

function cleanup () {
  clearInterval(intervalId)
  console.log('cleaning up MediaAudioRecorder')
  if (media) {
    if (status.value !== 'stopped') {
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
function update () {
  if (!media) return
  media.getCurrentAmplitude(amp => {
    ampSum += amp
    updateCount++
    if (updateCount % amplitudeWindowSize === 0) {
      amplitudes.copyWithin(0, 1)
      amplitudes[amplitudes.length - 1] = Math.round(255 * (ampSum / amplitudeWindowSize))
      ampSum = 0
    }
    if (status.value === 'running') {
      elapsed.value = Date.now() - startTime
    }
  }, err => {
    console.error(err)
  })
}

async function startRecording () {
  amplitudes.fill(0)
  ampSum = 0
  elapsed.value = 0
  mediaSrc.value = `cdvfile://localhost/temporary/recording-${uuidv4()}.mp3`
  media = new Media(mediaSrc.value, resolve, reject, s => {
    switch (s) {
      case Media.MEDIA_STARTING:
        status.value = 'starting'
        break
      case Media.MEDIA_RUNNING:
        status.value = 'running'
        startTime = Date.now()
        break
      case Media.MEDIA_STOPPED:
        status.value = 'stopped'
        break
      case Media.MEDIA_PAUSED:
        status.value = 'paused'
        break
    }
  })

  setInterval(update, updateInterval)

  media.startRecord()
}

async function onClose () {
  cleanup()
  visible.value = false
}

onBeforeUnmount(onClose)

const formattedElapsed = computed(() => {
  return formatDuration(elapsed.value)
})

const barColor = computed(() => {
  return singleton.darkTheme ? 'white' : 'black'
})
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
      <v-col>
        <svg
          width="100%"
          :height="height"
          :viewBox="`0 0 ${width} ${height}`"
        >
          <rect
            v-for="(amp, i) in amplitudes"
            :key="i"
            :x="i * barWidth"
            :y="(height - (amp / 255) * height) / 2"
            :width="barWidth"
            :height="(amp / 255) * height"
            :fill="barColor"
          />
        </svg>
      </v-col>
      <v-row
        no-gutters
        class="justify-center"
      >
        <h2>{{ formattedElapsed }}</h2>
      </v-row>
      <v-row
        no-gutters
        class="justify-center"
      >
        <v-btn
          v-if="status === 'stopped' "
          @click="startRecording"
          x-large
          elevation="11"
        >
          <v-icon x-large>
            mdi-record
          </v-icon>
        </v-btn>
        <v-btn
          v-else-if="status !== 'stopped'"
          @click="stopRecording"
          x-large
          elevation="11"
        >
          <v-icon x-large>
            mdi-stop
          </v-icon>
        </v-btn>
      </v-row>
    </TrellisModal>
  </div>
</template>

<style lang="sass">

</style>
