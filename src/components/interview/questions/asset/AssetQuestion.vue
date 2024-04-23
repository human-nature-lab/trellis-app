<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'
import { logError } from '@/helpers/log.helper'
import mediaCapture from '@/cordova/media-capture'

const props = defineProps<{
  question: Question
  respondent: Respondent
  location: object
}>()

const loading = ref(false)
const types = computed(() => {
  const qp = props.question.questionParameters.find(qp => qp.parameter.name === 'asset_types')
  return qp.val ? JSON.parse(qp.val) : ['audio', 'video', 'image', 'file']
})

const files = computed(() => {
  const data = (props.question.datum && props.question.datum.data) || []
  
})

async function captureAudio () {
  const files = await mediaCapture.captureAudio({ limit: 1 })
}

async function captureVideo () {

}

async function captureImage () {

}

async function uploadFile () {

}

async function addType (t: string) {
  if (loading.value) return
  loading.value = true

  try {
    console.log('add type', t)
    switch (t) {
      case 'audio':
        await captureAudio()
        break
      case 'video':
        await captureVideo()
        break
      case 'image':
        await captureImage()
        break
      case 'file':
        await uploadFile()
        break
      default:
        throw new Error('Unknown type: ' + t)
    }
  } catch (e) {
    logError(e)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <v-col>
    <v-row no-gutters>
      <v-btn
        v-for="t in types"
        :key="t"
        @click="addType(t)"
      >
        Add {{ t }}
      </v-btn>
    </v-row>
    <v-list>
      <v-list-item
        v-for="(file, index) in files"
        :key="index"
      >
        {{ file }}
      </v-list-item>
    </v-list>
  </v-col>
</template>

<style lang="sass">

</style>
