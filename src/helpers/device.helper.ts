import { ref } from 'vue'
import DeviceService from '@/services/device'

export function useDeviceName () {
  const loading = ref(true)
  const name = ref()
  const error = ref()

  async function load () {
    loading.value = true
    try {
      name.value = await DeviceService.getDeviceName()
    } catch (e) {
      console.error('Failed to load device name', e)
      error.value = e
    } finally {
      loading.value = false
    }
  }

  load()
  return { loading, name, error }
}

export function useDeviceId () {
  const loading = ref(true)
  const deviceId = ref('')
  const error = ref()

  async function load () {
    loading.value = true
    try {
      deviceId.value = await DeviceService.getUUID()
    } catch (e) {
      console.error('Failed to load device id', e)
      error.value = e
    } finally {
      loading.value = false
    }
  }

  load()
  return { loading, deviceId, error }
}

export function useServerAddress () {
  const address = ref('')
  const loading = ref(true)
  const error = ref()
  async function reload () {
    loading.value = true
    try {
      address.value = await DatabaseService.getServerIPAddress()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  reload()
  return { address, loading, error, reload }
}
