import { Ref, ref, watch } from 'vue'

type DirtyRef<T> = Ref<T> & { isDirty: Ref<boolean>, reset: () => void }

export function dirtyRef<T> (v: () => T, defaultVal?: T): DirtyRef<T> {
  const r = ref() as DirtyRef<T>
  r.isDirty = ref(false)
  r.reset = () => {
    r.isDirty.value = false
    r.value = v()
  }

  watch(v, val => {
    if (val !== undefined) {
      r.value = val
    } else if (defaultVal !== undefined) {
      r.value = defaultVal
    }
  }, { immediate: true })

  watch(r, () => {
    r.isDirty.value = true
  })

  return r
}
