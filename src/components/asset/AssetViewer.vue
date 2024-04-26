<script setup lang="ts">
import Asset from '@/entities/trellis/Asset'
import AssetService from '@/services/asset'
import { ref, watch } from 'vue'

const props = defineProps<{
  asset: Asset
} | {
  assetId: string
}>()

const asset = ref<Asset>(null)
const blobUrl = ref<string>()
const loading = ref(false)
const error = ref<Error>(null)

watch(() => [props.asset, props.assetId], async () => {
  if (props.assetId) {
    loading.value = true
    try {
      const assets = await AssetService.getAssets(props.assetId)
      asset.value = assets[0]
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  } else if (props.asset) {
    asset.value = props.asset
  }
}, { immediate: true })

watch(asset, async a => {
  if (a) {
    if (['image', 'video', 'audio'].includes(a.type)) {
      try {
        blobUrl.value = await AssetService.getAssetUrl(a.id)
      } catch (e) {
        error.value = e
      }
    }
  }
}, { immediate: true })

</script>

<template>
  <div class="asset">
    <v-progress-linear
      v-if="loading"
      indetermiante
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
  </div>
</template>

<style lang="sass">

</style>
