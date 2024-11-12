import { Mutex } from 'async-mutex'

export interface Storage<K> {
  get<T = K> (key: string): Promise<T>
  set<T = K> (key: string, val: T): Promise<void>
  delete (key: string): Promise<void>
  clear (): Promise<void>
  items<T = K> (): Promise<T[]>
}

type localItem = {
  type?: 'date'
  val: any
}
export class LocalStorage<K> implements Storage<K> {
  get<T = K> (key: string): Promise<T | null> {
    return this.coerce(localStorage.getItem(key))
  }

  private coerce<T = K> (raw: string | null): T | null {
    if (raw === null) {
      return null
    }
    const item = JSON.parse(raw) as localItem
    if (item.type === 'date') {
      item.val = new Date(item.val)
    }
    return item.val
  }

  async set<T = K> (key: string, val: T): Promise<void> {
    const item: localItem = {
      val,
    }
    if (val instanceof Date) {
      item.type = 'date'
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  async delete (key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear (): Promise<void> {
    localStorage.clear()
  }

  async items<T = K> (): Promise<T[]> {
    const res = []
    let item: T
    let i = 0
    do {
      item = this.coerce(localStorage.key(i))
      i++
      if (item) {
        res.push(item)
      }
    } while (item)
    return res
  }
}

export class NamespaceStorage<K> implements Storage<K> {
  private index = new Set<string>()
  private isInitialized = false
  private mut = new Mutex()

  constructor (public namespace: string, private storage: Storage<K>) {
    this.init()
  }

  private init () {
    return this.mut.runExclusive(async () => {
      if (this.isInitialized) return
      const existing = await this.storage.get<string[]>(this.namespace + '___index___')
      if (existing) {
        this.index = new Set(existing)
      }
      this.isInitialized = true
    })
  }

  private async syncIndex () {
    this.storage.set(this.namespace + '___index___', Array.from(this.index))
  }

  async get<T = K> (key: string): Promise<T | null> {
    await this.init()
    return this.storage.get(this.namespace + key)
  }

  async set<T = K> (key: string, val: T): Promise<void> {
    await this.init()
    this.index.add(key)
    key = this.namespace + key
    await this.storage.set(key, val)
    await this.syncIndex()
  }

  async delete (key: string) {
    await this.init()
    await this.storage.delete(this.namespace + key)
    this.index.delete(key)
    await this.syncIndex()
  }

  async items<T = K> (): Promise<T[]> {
    const res = []
    for (const key of this.index) {
      res.push(await this.storage.get(key))
    }
    return res
  }

  async clear () {
    await this.init()
    for (const key of this.index) {
      await this.storage.delete(key)
    }
    this.index.clear()
    await this.syncIndex()
  }
}
