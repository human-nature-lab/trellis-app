import { FileUploadOptions } from '@/services/media-capture/media-capture-interface'
import { ref } from 'vue'

export const visible = ref(false)
export const resolver = ref<(files: File[]) => void>()
export const rejecter = ref<(err: Error) => void>()
export const opts = ref<FileUploadOptions>()
export const uploaderRef = ref()

export function requestUpload(options?: FileUploadOptions) {
  if (visible.value) {
    throw new Error('Upload dialog already open')
  }
  if (!uploaderRef.value) {
    throw new Error('No uploader component found in DOM')
  }
  opts.value = options
  return new Promise<File[]>((resolve, reject) => {
    visible.value = true
    resolver.value = resolve
    rejecter.value = reject
  }).finally(() => {
    visible.value = false
  })
}
