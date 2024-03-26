import { LocalStorageStore, LocalStorageStoreOpts } from './local-storage'
import { MemoryStore } from './memory-store'
import { SetOpts, Store } from './types'

export function UseLocalStorageStore (opts?: LocalStorageStoreOpts) {
  return function (constructor: Function) {
    console.log('setting cache store', constructor.name)
    constructor.prototype.__cache_store = new LocalStorageStore(opts)
  }
}

export function UseMemoryStore () {
  return function (constructor: Function) {
    console.log('setting cache store', constructor.name)
    constructor.prototype.__cache_store = new MemoryStore()
  }
}

export type DerivedKey<T extends any[]> = {
  key?: string | ((...args: T) => string)
}

export type CachedOpts<T extends any[]> = {
  lifetime?: number | ((...args: T) => number)
} & DerivedKey<T>

export function Cached<T extends any[]> (opts?: CachedOpts<T>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: T) {
      if (!target.__cache_store) {
        throw new Error('No cache store found on this class. Add UseLocalStorageStore or UseMemoryStore to the class.')
      }
      const store: Store = target.__cache_store
      let key = propertyKey
      if (opts && opts.key) {
        key = typeof opts.key === 'function' ? opts.key(...args) : opts.key
      }
      console.log('checking cache for key', key)
      const cached = store.get(key)
      if (cached) {
        console.log('returning cached', cached)
        return cached
      }
      console.log('cache miss')
      const result = originalMethod.apply(this, args)
      const setOpts = {} as SetOpts
      if (opts && opts.lifetime) {
        setOpts.lifetime = opts.lifetime
      }
      if (result instanceof Promise) {
        console.log('awaiting promise')
        return result.then((res) => {
          console.log('setting cache from promise result', key, res, setOpts)
          store.set(key, res, setOpts)
          return res
        })
      } else {
        console.log('setting cache from result', key, result, setOpts)
        store.set(key, result, setOpts)
        return result
      }
    }
    return descriptor
  }
}

export function DeleteCached<T extends any[]> (opts?: DerivedKey<T>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: T) {
      if (!target.__cache_store) {
        throw new Error('No cache store found on this class. Add UseLocalStorageStore or UseMemoryStore to the class.')
      }
      const store: Store = target.__cache_store
      const res = originalMethod.apply(this, args)
      const key = typeof opts.key === 'function' ? opts.key(...args) : opts.key
      store.remove(key)
      return res
    }
    return descriptor
  }
}
