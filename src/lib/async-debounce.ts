import { ref } from 'vue'

export function asyncDebounce<T extends any[], R = any> (fn: (...args: T) => PromiseLike<R>, delayMs: number) {
  const working = ref(false)
  let lastArgs: T = null
  let timeoutId = null
  const call = async (...args: T) => {
    clearTimeout(timeoutId)
    working.value = true
    lastArgs = args
    timeoutId = setTimeout(async () => {
      const res = await fn(...lastArgs)
      working.value = args === lastArgs
      if (working.value) {
        timeoutId = null
      }
      return res
    }, delayMs)
  }

  return { working, call }
}
