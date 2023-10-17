import { ref } from 'vue'

export function reactiveSet<T> (vals?: T[]) {
  const set = ref(new Set<T>(vals))
  const add = (val: T) => {
    set.value.add(val)
    set.value = new Set(set.value)
  }
  const remove = (val: T) => {
    set.value.delete(val)
    set.value = new Set(set.value)
  }
  const clear = () => {
    set.value.clear()
    set.value = new Set(set.value)
  }
  const has = (val: T) => set.value.has(val)
  return {
    add,
    delete: remove,
    clear,
    has,
    get size () { return set.value.size },
    values () { return set.value.values() },
    entries () { return set.value.entries() },
  }
}
