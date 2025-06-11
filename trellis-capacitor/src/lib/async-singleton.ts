import { Mutex } from 'async-mutex'

export function asyncSingleton<T> (fn: () => Promise<T>): () => Promise<T> {
  let instance: T | null = null
  const mut = new Mutex()
  return async () => {
    return await mut.runExclusive(async () => {
      if (instance) {
        return instance
      }
      instance = await fn()
      return instance
    })
  }
}
