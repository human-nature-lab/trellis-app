<script setup lang="ts">
import { ref, computed } from 'vue'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'
import { logError } from '@/helpers/log.helper'
import { useAssets } from '@/helpers/assets.helper'
import MediaCaptureService from '@/services/media-capture'
import AssetService from '@/services/asset'
import { FSFileEntry } from '@/cordova/file'
import { action } from '../../lib/action'
import ActionTypes from '@/static/action.types'
import Asset from '@/entities/trellis/Asset'
import AssetRow from './AssetRow.vue'
import AssetViewer from '@/components/asset/AssetViewer.vue'
import TrellisModal from '@/components/TrellisModal.vue'
import { i18n } from '@/i18n'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  question: Question
  respondent: Respondent
  location: object
}>()
const working = ref(false)

const types = computed(() => {
  if (!props.question || !props.question.questionParameters) return ['audio', 'video', 'image', 'file']
  const qp = props.question.questionParameters.find(qp => qp.parameter.name === 'asset_types')
  return (qp && qp.val) ? JSON.parse(qp.val) : ['audio', 'video', 'image', 'file']
})

const allowAudio = computed(() => types.value.includes('audio'))
const allowVideo = computed(() => types.value.includes('video'))
const allowImage = computed(() => types.value.includes('image'))
const allowFile = computed(() => types.value.includes('file'))

const { assets, loading: assetsLoading, error } = useAssets(() =>
  (props.question.datum && props.question.datum.data.map(d => d.assetId)) || [],
)

function addAssets (assets: Asset[]) {
  for (const asset of assets) {
    action(props.question.id, ActionTypes.add_asset, {
      val: asset.id,
      name: 'asset',
      asset_id: asset.id,
    })
  }
}

async function mediaToAssets (files: (File | FSFileEntry)[]) {
  return Promise.all(files.map(async f => {
    let fileName = ''
    if (f instanceof FSFileEntry || ('name' in f && typeof f.name === 'string' && f.name.length > 3)) {
      fileName = f.name
    }
    const mimeType = (f instanceof FSFileEntry) ? (await f.type()) : f.type
    const payload = { fileName, isFromSurvey: true, mimeType }
    console.log('creating asset', payload)
    return AssetService.createAsset(payload, f)
  }))
}

async function captureAudio () {
  if (working.value) return
  working.value = true
  try {
    const files = await MediaCaptureService.captureAudio()
    addAssets(await mediaToAssets(files))
  } catch (e) {
    debugger
    logError(e)
    throw e
  } finally {
    working.value = false
  }
}

async function captureVideo () {
  if (working.value) return
  working.value = true
  try {
    const files = await MediaCaptureService.captureVideo()
    addAssets(await mediaToAssets(files))
  } catch (e) {
    logError(e)
  } finally {
    working.value = false
  }
}

async function captureImage () {
  if (working.value) return
  working.value = true
  try {
    const files = await MediaCaptureService.captureImage()
    addAssets(await mediaToAssets(files))
  } catch (e) {
    logError(e)
  } finally {
    working.value = false
  }
}

async function uploadFile () {
  if (working.value) return
  working.value = true
  try {
    const files = await MediaCaptureService.uploadFile()
    console.log('uploaded', files)
    const assets = await mediaToAssets(files)
    console.log('assets', assets)
    addAssets(assets)
    console.log('added assets')
  } catch (e) {
    logError(e)
  } finally {
    working.value = false
  }
}

async function removeAsset (asset: Asset) {
  if (!confirm(i18n.t('remove_confirm', [i18n.t('asset')]) as string)) return
  action(props.question.id, ActionTypes.remove_asset, {
    val: asset.id,
    name: 'asset',
    asset_id: asset.id,
  })
}

const previewAsset = ref<Asset | null>(null)
const isBusy = computed(() => working.value || assetsLoading.value)

</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="isBusy"
      indeterminate
    />
    <v-row no-gutters>
      <v-btn
        v-if="allowAudio"
        @click="captureAudio"
        :disabled="isBusy"
      >
        {{ $t('capture_audio') }}
      </v-btn>
      <v-btn
        v-if="allowVideo"
        @click="captureVideo"
        :disabled="isBusy"
      >
        {{ $t('capture_video') }}
      </v-btn>
      <v-btn
        v-if="allowImage"
        @click="captureImage"
        :disabled="isBusy"
      >
        {{ $t('capture_image') }}
      </v-btn>
      <v-btn
        v-if="allowFile"
        @click="uploadFile"
        :disabled="isBusy"
      >
        {{ $t('upload_file') }}
      </v-btn>
    </v-row>
    <v-list>
      <AssetRow
        v-for="asset in assets"
        :key="asset.id"
        :asset="asset"
        @remove="removeAsset(asset)"
        @preview="previewAsset = asset"
      />
    </v-list>
    <TrellisModal
      v-if="previewAsset"
      :value="!!previewAsset"
      @input="previewAsset = null"
    >
      <AssetViewer :asset="previewAsset" />
    </TrellisModal>
  </v-col>
</template>
