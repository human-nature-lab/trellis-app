import Vue, { onBeforeUnmount, ref } from 'vue'
import { insomnia } from '@/cordova/insomnia'

export const visible = ref(false)
export const recording = ref(false)
export const recorderRef = ref<Vue>()
export const resolver = ref<(f: Blob) => void>()
export const rejecter = ref<(e: Error) => void>()

export function requestWebRecording () {
  if (visible.value || recording.value) {
    return Promise.reject(new Error('Recording already in progress'))
  }
  if (!recorderRef.value) return Promise.reject(new Error('WebAudioRecorder element is not in DOM'))
  return insomnia.withScreenOn(async () => {
    return new Promise<Blob>((resolve, reject) => {
      visible.value = true
      resolver.value = resolve
      rejecter.value = reject
    }).finally(() => {
      visible.value = false
    })
  })
}

export function useAnalyserNode () {
  const audioContext = new AudioContext()
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 1024

  onBeforeUnmount(() => {
    analyser.disconnect()
    audioContext.close()
  })
  return { analyser, audioContext }
}
