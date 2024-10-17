import { memoize } from 'lodash'
import { onBeforeUnmount } from 'vue'

type Resolver<A extends any[]> = (...args: A) => (number | string | symbol)
export function useMemoize<T, A extends any[]> (cb: (...args: A) => T, resolver?: Resolver<A>) {
  const memo = memoize(cb, resolver)
  onBeforeUnmount(() => memo.cache.clear())
  return memo
}
