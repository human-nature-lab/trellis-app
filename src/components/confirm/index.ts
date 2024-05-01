import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { Stringable } from '@/types'

export const confirmRef = ref<typeof ConfirmDialog>()
export const visible = ref(false)
export const message = ref('')
export const resolver = ref<(result: boolean) => void>()

export function confirm (msg: Stringable): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!confirmRef.value) {
      reject(new Error('Confirm dialog not mounted'))
    }
    try {
      visible.value = true
      resolver.value = resolve
      message.value = '' + msg
    } catch (e) {
      reject(e)
    } finally {
      visible.value = false
    }
  })
}
