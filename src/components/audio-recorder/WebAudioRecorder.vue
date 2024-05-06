<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TrellisModal from '@/components/TrellisModal.vue'
import { visible, recording, recorderRef, resolver, rejecter, useAnalyserNode } from './recorder'
import { v4 as uuidv4 } from 'uuid'

const { analyser, audioContext } = useAnalyserNode()
let ctx: CanvasRenderingContext2D | null = null
const dataArray = new Uint8Array(analyser.frequencyBinCount)
const canvas = ref<HTMLCanvasElement>()
const state = ref()
const devices = ref<MediaDeviceInfo[]>([])
const startTime = ref(0)
const endTime = ref(0)
let running = true
let animationId: number
let recorder: MediaRecorder | null = null
let stream: MediaStream | null = null
let file: FileSystemFileHandle

const mimeType = computed(() => {
  const mimeTypePrefernces = ['audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg']
  return mimeTypePrefernces.find(type => MediaRecorder.isTypeSupported(type))
})

const duration = computed(() => {
  return endTime.value - startTime.value
})

function cleanup () {
  if (recorder) {
    recorder.stop()
    recorder = null
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}
async function resolve () {
  cleanup()
  if (resolver.value && file) {
    const f = await file.getFile()
    resolver.value(f)
  }
}

function reject (err: Error) {
  cleanup()
  if (rejecter.value) {
    rejecter.value(err)
  }
}

watch(visible, async (value) => {
  if (value) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        debugger
        throw new Error('Media devices not supported')
      }
      devices.value = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'audioinput')
    } catch (err) {
      debugger
      console.error(err)
      reject(err)
    }
  }
}, { immediate: true })

function draw () {
  const width = canvas.value.width
  const height = canvas.value.height
  ctx.fillStyle = 'rgb(200 200 200)'
  ctx.fillRect(0, 0, width, height)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgb(0 0 0)'

  ctx.beginPath()

  const sliceWidth = (width * 1.0) / dataArray.length
  let x = 0

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    x += sliceWidth
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

function render () {
  if (!running || !ctx || !recorder) {
    return
  }
  endTime.value = Date.now()
  animationId = requestAnimationFrame(render)
  analyser.getByteTimeDomainData(dataArray)
  draw()
}

async function startRecording () {
  if (!visible.value || recording.value) {
    return
  }
  if (!devices.value.length) {
    reject(new Error('No audio devices found'))
    return
  }
  // Get default audio stream
  const constraints: MediaTrackConstraints = {
    deviceId: { ideal: devices.value[0].deviceId },
  }
  stream = await navigator.mediaDevices.getUserMedia({ audio: constraints })
  const streamSrc = audioContext.createMediaStreamSource(stream)
  streamSrc.connect(analyser)
  recorder = new MediaRecorder(stream, { mimeType: mimeType.value })
  const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('audio', { create: true })
  // for (const entry of await dir.entries()) {
  //   console.log(entry.name)
  // }
  file = await dir.getFileHandle(`recording-${uuidv4()}.webm`, { create: true })
  const writer = await file.createWritable()

  // const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  recorder.ondataavailable = async e => {
    console.log('dataavailable', e.data.size)
    await writer.write(e.data)
  }
  recorder.onerror = async e => {
    debugger
    await writer.close()
    recording.value = false
    state.value = recorder.state
    reject(new Error(e.error))
  }
  recorder.onstop = async () => {
    endTime.value = Date.now()
    streamSrc.disconnect()
    recording.value = false
    state.value = recorder.state
    await writer.close()
    resolve()
  }
  recorder.onstart = () => {
    startTime.value = Date.now()
    state.value = recorder.state
    animationId = requestAnimationFrame(render)
  }
  const timesliceMS = 30 * 1000 // try to write data every 30 seconds
  recorder.start(timesliceMS)
  recording.value = true
  state.value = recorder.state
}

function stopRecording () {
  if (!recording.value) {
    return
  }
  recorder.stop()
}

function toggleRecording () {
  if (recording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function unmount () {
  cleanup()
  running = false
  ctx = null
  cancelAnimationFrame(animationId)
}

function onClose () {
  unmount()
  console.log('onClose')
  if (!recording.value) {
    reject(new Error('Recording cancelled'))
  }
}

onBeforeUnmount(unmount)

watch(canvas, el => {
  if (!el) return
  ctx = el.getContext('2d')
  draw()
}, { immediate: true })
</script>

<template>
  <TrellisModal
    :title="$t('record_audio')"
    v-model="visible"
    @close="onClose"
    fullscreen
    ref="recorderRef"
    :persistent="recording"
  >
    <v-col v-if="visible">
      <v-row no-gutters>
        <canvas
          ref="canvas"
          width="400"
          height="200"
        />
      </v-row>
      <v-row
        no-gutters
        class="justify-center"
      >
        <v-btn @click="toggleRecording">
          <v-icon v-if="recording">
            mdi-stop
          </v-icon>
          <v-icon v-else>
            mdi-record
          </v-icon>
        </v-btn>
        <v-col>
          Duration: {{ duration }}
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          Visible: {{ visible }}
          Recording: {{ recording }}
        </v-col>
        <v-col>
          State: {{ state }}
          Mime type: {{ mimeType }}
        </v-col>
      </v-row>
    </v-col>
  </TrellisModal>
</template>

<style lang="sass">

</style>
