import { SetOpts, Store } from './types'

type StorageObj<T> = {
  val: T
  expiresAt?: number
}

export class MemoryStore implements Store {
  private store: Map<string, StorageObj<any>>

  constructor () {
    this.store = new Map()
  }

  set<T> (key: string, value: T, opts?: SetOpts) {
    const o = { val: JSON.parse(JSON.stringify(value)) } as StorageObj<T>
    if (opts && opts.lifetime) {
      const lifetime = typeof opts.lifetime === 'function' ? opts.lifetime() : opts.lifetime
      o.expiresAt = Date.now() + lifetime
    }
    this.store.set(key, o)
  }

  get<T> (key: string): T | null {
    const o = this.store.get(key)
    if (!o) {
      return null
    }
    if (o.expiresAt && o.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return o.val
  }

  remove (key: string) {
    this.store.delete(key)
  }

  clear () {
    this.store.clear()
  }

  all (): Iterable<[string, any]> {
    return this.store.entries()
  }
}
