<script setup lang="ts">
import { ref, watch } from 'vue'
import saveAs from 'file-saver'
import { useRoute } from 'vue-router/composables'
import FormatBytes from '@/filters/format-bytes.filter'
import Asset from '@/entities/trellis/Asset'
import { logError } from '@/helpers/log.helper'
import AssetService from '@/services/asset'

const route = useRoute()
const asset = ref<Asset>(null)
const loading = ref(false)
const downloading = ref(false)
const blob = ref<Blob>(null)
const blobText = ref<string | null>(null)
const blobUrl = ref<string>()
async function fetchAsset (id: string) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await AssetService.getAssets(id)
    asset.value = res[0]
    switch (asset.value.type) {
      case 'image':
      case 'video':
      case 'audio':
        blob.value = await AssetService.downloadAsset(id)
        blobUrl.value = URL.createObjectURL(blob.value)
        break
      case 'text':
        blob.value = await AssetService.downloadAsset(id)
        blobText.value = await blob.value.text()
        break
    }
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, async (id) => {
  if (id) {
    await fetchAsset(id)
  }
}, { immediate: true })

async function downloadAsset (asset: Asset) {
  if (downloading.value) return
  downloading.value = true
  try {
    const data = await AssetService.downloadAsset(asset.id)
    saveAs(data, asset.fileName)
  } catch (e) {
    logError(e)
  } finally {
    downloading.value = false
  }
}

</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="loading || downloading"
      indeterminate
    />
    <v-col v-else>
      <v-row no-gutters>
        <h2>{{ $t('asset') }}</h2>
        <v-spacer />
        <div class="pa-2">
          {{ FormatBytes(asset.size) }}
        </div>
        <v-btn
          @click="downloadAsset(asset)"
          :disabled="loading || downloading"
          class="ml-2"
        >
          {{ $t('download_asset_type', [asset.type === 'unknown' ? '' : asset.type]) }} <v-icon>mdi-download</v-icon>
        </v-btn>
      </v-row>
      <v-row no-gutters>
        <h3>{{ asset.fileName }}</h3>
      </v-row>
      <v-card class="my-4">
        <v-card-title>{{ $t('asset_preview') }}</v-card-title>
        <v-card-text>
          <img
            v-if="asset.type === 'image'"
            :src="blobUrl"
          >
          <video
            v-else-if="asset.type === 'video'"
            controls
          >
            <source
              :src="blobUrl"
              type="video/mp4"
            >
            {{ $t('video_not_supported') }}
          </video>
          <audio
            v-else-if="asset.type === 'audio'"
            controls
          >
            <source
              :src="blobUrl"
              :type="asset.mimeType"
            >
            {{ $t('audio_not_supported') }}
          </audio>
          <pre v-else-if="asset.type === 'text'">{{ blobText.slice(0, 1000) }}...</pre>
          <v-row
            v-else
            no-gutters
          >
            {{ $t('no_preview_available') }}
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-col>
</template>

<style lang="sass">

</style>
