import Vue, { ref } from 'vue'
import uuidv4 from 'uuid/v4'
import { file } from '@/cordova/file'

export const visible = ref(false)
export const recording = ref(false)
export const recorderRef = ref<Vue>()
export const resolver = ref<(f: Blob) => void>()
export const rejecter = ref<(e: Error) => void>()

export async function requestWebRecording () {
  if (visible.value || recording.value) {
    return Promise.reject(new Error('Recording already in progress'))
  }
  if (!recorderRef.value) return Promise.reject(new Error('WebAudioRecorder element is not in DOM'))
  const blob = await new Promise<Blob>((resolve, reject) => {
    visible.value = true
    resolver.value = resolve
    rejecter.value = reject
  }).finally(() => {
    visible.value = false
  })
  const dir = await file.temporary()
  const id = uuidv4()
  const name = `${id}.webm`
  const fileEntry = await dir.root.writeFile(name, blob)
  return {
    name,
    fullPath: fileEntry.nativeURL,
    type: blob.type,
    lastModifiedDate: new Date(),
    size: blob.size,
  } as MediaFile
}
