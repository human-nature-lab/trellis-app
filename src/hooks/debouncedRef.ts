import { customRef } from 'vue'

export function debouncedRef<T>(v: T, delay = 200) {
  return customRef((track, trigger) => {
    let value = v
    let timeout
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      },
    }
  }
}
