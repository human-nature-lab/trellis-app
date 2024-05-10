import { WatchSource, ref, watch } from 'vue'
import Asset from '@/entities/trellis/Asset'
import AssetService from '@/services/asset'

export function useAssets (source: WatchSource<string[]>) {
  const assets = ref<Asset[]>([])
  const loading = ref(false)
  const error = ref<Error>()

  watch(source, async (ids) => {
    if (ids.length === 0) {
      assets.value = []
      return
    }
    loading.value = true
    try {
      assets.value = await AssetService.getAssets(...ids)
      error.value = null
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }, { immediate: true })

  return { assets, loading, error }
}
