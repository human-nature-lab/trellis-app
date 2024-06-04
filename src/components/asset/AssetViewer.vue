<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Asset from '@/entities/trellis/Asset'
import AssetService from '@/services/asset'

const props = defineProps<{
  asset?: Asset
  assetId?: string
}>()

const asset = ref<Asset>(null)
const blobUrl = ref<string>()
const loadingAsset = ref(false)
const error = ref<Error>(null)
const loadingBlob = ref(false)

watch(() => [props.asset, props.assetId], async () => {
  if (props.assetId) {
    loadingAsset.value = true
    try {
      const assets = await AssetService.getAssets(props.assetId)
      asset.value = assets[0]
    } catch (e) {
      error.value = e
    } finally {
      loadingAsset.value = false
    }
  } else if (props.asset) {
    asset.value = props.asset
  }
}, { immediate: true })

watch(asset, async a => {
  if (a) {
    if (['image', 'video', 'audio'].includes(a.type)) {
      try {
        loadingBlob.value = true
        blobUrl.value = await AssetService.getAssetUrl(a.id)
      } catch (e) {
        error.value = e
      } finally {
        loadingBlob.value = false
      }
    }
  }
}, { immediate: true })

const loading = computed(() => loadingAsset.value || loadingBlob.value)

</script>

<template>
  <div class="asset">
    <v-progress-linear
      v-show="loading"
      indetermiante
    />
    <img
      v-if="asset.type === 'image' && blobUrl"
      :src="blobUrl"
    >
    <video
      v-else-if="asset.type === 'video' && blobUrl"
      controls
    >
      <source
        :src="blobUrl"
        :type="asset.mimeType"
      >
      {{ $t('video_not_supported') }}
    </video>
    <audio
      v-else-if="asset.type === 'audio' && blobUrl"
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

<style lang="sass" scoped>
  .asset
    img, video
      max-width: min(100vw, 100%)
      max-height: max(100vh, 80%)
      margin: auto
</style>
