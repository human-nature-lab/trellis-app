<script setup lang="ts">
import { onMounted, ref } from 'vue'
import mediaCapture from '@/cordova/media-capture'
import { v4 as uuidv4 } from 'uuid'
import AssetService from '@/services/asset'
import { FSFileEntry, file } from '@/cordova/file'
import MediaCaptureService from '@/services/media-capture'

const limit = ref(0)
const durationSeconds = ref(30)
const files = ref<(FSFileEntry | Blob)[]>([])
async function captureImage () {
  const res = await MediaCaptureService.captureImage()
  console.log(res)
  files.value.push(...res)
}
async function captureVideo () {
  const res = await MediaCaptureService.captureVideo()
  console.log(res)
  files.value.push(...res)
}
async function captureAudio () {
  const res = await MediaCaptureService.captureAudio()
  console.log(res)
  files.value.push(...res)
}
async function captureExternalAudio () {
  const res = await MediaCaptureService.captureExternalAudio()
  console.log(res)
  files.value.push(...res)
}

const audioModes = ref()
const videoModes = ref()
const imageModes = ref()
onMounted(async () => {
  audioModes.value = await mediaCapture.supportedAudioModes()
  videoModes.value = await mediaCapture.supportedVideoModes()
  imageModes.value = await mediaCapture.supportedImageModes()
})

async function addAsset (f: FSFileEntry | Blob) {
  const fileName = f instanceof FSFileEntry ? f.name : uuidv4()
  const type = f instanceof FSFileEntry ? (await f.type()) : f.type
  await AssetService.createAsset({ fileName, type, isFromSurvey: false }, f)
}
</script>

<template>
  <v-col>
    <v-row no-gutters>
      <v-btn :to="{ name: 'Files'}">
        Files
      </v-btn>
      <v-btn :to="{ name: 'Assets'}">
        Assets
      </v-btn>
    </v-row>
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
      <v-btn @click="captureExternalAudio">
        Capture external audio
      </v-btn>
    </v-row>
    <v-list>
      <v-list-item
        v-for="(file, index) in files"
        :key="index"
      >
        {{ index }}
        <v-btn @click="addAsset(file)">
          Add asset
        </v-btn>
      </v-list-item>
    </v-list>
  </v-col>
</template>

<style lang="sass">

</style>
