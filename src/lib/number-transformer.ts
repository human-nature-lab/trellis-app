import { Ref, ref, watch } from 'vue'

export function numberTransformer<T extends object> (target: Ref<T>, key: string): Ref<number> {
  const value = ref(+target.value[key])

  watch(() => value.value, () => {
    target.value[key] = +value.value
  })

  return value
}
