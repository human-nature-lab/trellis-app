import { WatchCallback, watch } from 'vue'

export function onceSet (v: WatchCallback, timeout = 0) {
  return new Promise((resolve, reject) => {
    let isComplete = false
    let timeoutId
    const stop = watch(v, val => {
      if (!isComplete) {
        stop()
        clearTimeout(timeoutId)
        isComplete = true
        resolve(val)
      }
    }, { immediate: true })
    if (timeout && !isComplete) {
      timeoutId = setTimeout(() => {
        if (!isComplete) {
          isComplete = true
          stop()
          reject(new Error('Timeout'))
        }
      })
    }
  })
}
