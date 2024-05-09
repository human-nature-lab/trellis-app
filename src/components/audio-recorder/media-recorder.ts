import { file } from '@/cordova/file'
import Vue, { onBeforeUnmount, ref } from 'vue'

export const visible = ref(false)
export const recording = ref(false)
export const recorderRef = ref<Vue>()
export const resolver = ref<(f: string) => void>()
export const rejecter = ref<(e: Error) => void>()
export let writer: WritableStream

export async function requestMediaRecording () {
  if (visible.value || recording.value) {
    return Promise.reject(new Error('Recording already in progress'))
  }
  if (!recorderRef.value) return Promise.reject(new Error('MediaAudioRecorder element is not in DOM'))
  const src = await new Promise<string>((resolve, reject) => {
    visible.value = true
    resolver.value = resolve
    rejecter.value = reject
  }).finally(() => {
    visible.value = false
  })
  return file.resolveFileUri(src)
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
