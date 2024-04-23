import Vue, { ref } from 'vue'

export const active = ref(false)
export const recorderRef = ref<Vue>()
export const resolver = ref<(f: File) => void>()
export const rejecter = ref<(e: Error) => void>()

export function requestRecording () {
  if (active.value) return Promise.reject(new Error('Recording already in progress'))
  if (!recorderRef.value) return Promise.reject(new Error('AudioRecorder element is not in DOM'))
  return new Promise<File>((resolve, reject) => {
    active.value = true
    resolver.value = resolve
    rejecter.value = reject
  }).finally(() => {
    active.value = false
  })
}
