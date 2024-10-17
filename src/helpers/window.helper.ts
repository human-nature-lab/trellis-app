import { Hook } from '@/lib/Hook'
import { onUnmounted } from 'vue'


export const unloadHook = new Hook()
window.onbeforeunload = () => {
  return unloadHook.emit()
}

export function onBeforeUnload (cb: () => void) {
  const unsubscribe = unloadHook.add(cb)
  onUnmounted(unsubscribe)
}
