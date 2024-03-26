import { SetOpts, Store } from './types'

export type LocalStorageStoreOpts = {
  prefix: string
}

type StorageObj<T> = {
  expiresAt?: number
  val: T
}

export class LocalStorageStore implements Store {
  prefix: string
  keys: Set<string>

  constructor (opts: LocalStorageStoreOpts) {
    this.prefix = opts.prefix
    const keys = localStorage.getItem(this.prefix + '-keys')
    this.keys = new Set(keys ? JSON.parse(keys) : [])
  }

  private persistKeys () {
    localStorage.setItem(this.prefix + '-keys', JSON.stringify(this.keys.values()))
  }

  set<T> (key: string, value: T, opts?: SetOpts) {
    const obj = {
      val: value,
    } as StorageObj<T>
    if (opts && opts.expiresAt) {
      obj.expiresAt = opts.expiresAt
    }
    if (!this.keys.has(key)) {
      this.keys.add(key)
      this.persistKeys()
    }
    localStorage.setItem(this.prefix + key, JSON.stringify(obj))
  }

  get<T> (key: string): T | null {
    key = this.prefix + key
    if (!this.keys.has(key)) {
      return null
    }
    const strItem = localStorage.getItem(key)
    const item: StorageObj<T> = JSON.parse(strItem)
    if (item.expiresAt && item.expiresAt < Date.now()) {
      localStorage.removeItem(key)
      return null
    }
    return item.val
  }

  remove (key: string) {
    this.keys.delete(key)
    this.persistKeys()
    localStorage.removeItem(this.prefix + key)
  }

  clear () {
    for (const key of this.keys) {
      localStorage.removeItem(this.prefix + key)
    }
    this.keys.clear()
    this.persistKeys()
  }

  *all (): Iterable<[string, any]> {
    for (const key of this.keys) {
      yield [key, this.get(key)]
    }
  }
}
