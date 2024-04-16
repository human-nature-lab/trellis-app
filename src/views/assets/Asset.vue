<script setup lang="ts">
import { ref, watch } from 'vue'
import saveAs from 'file-saver'
import { useRoute } from 'vue-router/composables'
import FormatBytes from '@/filters/format-bytes.filter'
import Asset from '@/entities/trellis/Asset'
import { logError } from '@/helpers/log.helper'
import AssetService from '@/services/asset'
import { isWeb } from '@/helpers/singleton.helper'

const route = useRoute()
const asset = ref<Asset>(null)
const loading = ref(false)
const downloading = ref(false)
const blobUrl = ref<string>()
async function fetchAsset (id: string) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await AssetService.getAssets(id)
    asset.value = res[0]
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, async (id) => {
  if (id) {
    await fetchAsset(id)
  }
}, { immediate: true })

const loadingUrl = ref(false)
watch(asset, async a => {
  if (a) {
    if (['image', 'video', 'audio'].includes(a.type)) {
      try {
        loadingUrl.value = true
        blobUrl.value = await AssetService.getAssetUrl(a.id)
      } catch (e) {
        logError(e)
      } finally {
        loadingUrl.value = false
      }
    }
  }
}, { immediate: true })

async function downloadAsset () {
  if (downloading.value) return
  downloading.value = true
  try {
    const url = blobUrl.value || (await AssetService.getAssetUrl(asset.value.id))
    saveAs(url, asset.value.fileName)
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
      v-if="loading"
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
          v-if="isWeb"
          @click="downloadAsset"
          :disabled="downloading"
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
          <v-progress-linear
            v-if="loadingUrl"
            indeterminate
          />
          <img
            v-else-if="asset.type === 'image'"
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

<style lang="sass" scoped>
img, video
  max-width: 100%
</style>
