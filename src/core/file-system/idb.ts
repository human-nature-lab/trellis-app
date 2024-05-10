export type ObjectStore = {
  get<T> (key: IDBValidKey): Promise<T>
  getRange<T> (keys: IDBKeyRange, count?: number): Promise<T[]>
  put<T> (value: T, key?: IDBValidKey): Promise<void>
  delete (key: IDBValidKey | IDBKeyRange): Promise<void>
  clear (): Promise<void>
  keys (query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]>
  values<T> (query?: IDBValidKey | IDBKeyRange, count?: number): Promise<T[]>
  has (key: IDBValidKey | IDBKeyRange): Promise<boolean>
  index (name: string): Promise<IDBIndex>
  count (query?: IDBValidKey | IDBKeyRange): Promise<number>
}

export class TxObjectStore implements ObjectStore {
  constructor (private store: IDBObjectStore) {}

  get<T> (key: IDBValidKey) {
    return new Promise<T>((resolve, reject) => {
      const req = this.store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  getRange<T> (keys: IDBKeyRange, count?: number) {
    return new Promise<T[]>((resolve, reject) => {
      const req = this.store.getAll(keys, count)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  put<T> (value: T, key?: IDBValidKey) {
    return new Promise<void>((resolve, reject) => {
      const req = this.store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  delete (key: IDBValidKey | IDBKeyRange) {
    return new Promise<void>((resolve, reject) => {
      const req = this.store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  clear () {
    return new Promise<void>((resolve, reject) => {
      const req = this.store.clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  keys (query?: IDBValidKey | IDBKeyRange, count?: number) {
    return new Promise<IDBValidKey[]>((resolve, reject) => {
      const req = this.store.getAllKeys(query, count)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  values<T> (query?: IDBValidKey | IDBKeyRange, count?: number) {
    return new Promise<T[]>((resolve, reject) => {
      const req = this.store.getAll(query, count)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  has (key: IDBValidKey | IDBKeyRange) {
    return new Promise<boolean>((resolve, reject) => {
      const req = this.store.get(key)
      req.onsuccess = () => resolve(!!req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async index (name: string) {
    return this.store.index(name)
  }

  count (query?: IDBValidKey | IDBKeyRange) {
    return new Promise<number>((resolve, reject) => {
      const req = this.store.count(query)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}

export class Transaction {
  constructor (private tx: IDBTransaction) {}

  objectStore (store: string) {
    return new TxObjectStore(this.tx.objectStore(store))
  }

  commit () {
    this.tx.commit()
  }

  abort () {
    this.tx.abort()
  }
}

export class LazyObjectStore implements ObjectStore {
  constructor (private db: Database, private store: string) {}

  get<T> (key: IDBValidKey) {
    return this.db.get<T>(this.store, key)
  }

  getRange<T> (keys: IDBKeyRange) {
    return this.db.getRange<T>(this.store, keys)
  }

  put (value: any, key: IDBValidKey) {
    return this.db.put(this.store, value, key)
  }

  delete (key: IDBValidKey) {
    return this.db.delete(this.store, key)
  }

  async clear () {
    await this.db.clear(this.store)
  }

  keys () {
    return this.db.keys(this.store)
  }

  values<T> () {
    return this.db.values<T>(this.store)
  }

  has (key: IDBValidKey) {
    return this.db.has(this.store, key)
  }

  withTransaction<T> (
    cb: TxCallback<T>,
    mode: IDBTransactionMode,
    opts?: IDBTransactionOptions,
  ) {
    return this.db.withTransaction(cb, this.store, mode, opts)
  }

  index (name: string) {
    return this.db.withTransaction(tx => tx.objectStore(this.store).index(name), this.store, 'readonly')
  }

  count (query?: IDBValidKey | IDBKeyRange) {
    return this.db.withTransaction(tx => tx.objectStore(this.store).count(query), this.store, 'readonly')
  }
}

type TxCallback<T> = (tx: Transaction) => (T | PromiseLike<T>)

export class Database {
  public objectStoreNames: DOMStringList

  constructor (private db: IDBDatabase) {
    this.objectStoreNames = db.objectStoreNames
  }

  async withTransaction<T> (
    cb: TxCallback<T>,
    store: string | string[],
    mode: IDBTransactionMode,
    opts?: IDBTransactionOptions,
  ) {
    const tx = this.db.transaction(store, mode, opts)
    return cb(new Transaction(tx))
  }

  close () {
    this.db.close()
  }

  objectStore (store: string) {
    return new LazyObjectStore(this, store)
  }

  get<T> (store: string, key: IDBValidKey) {
    return this.withTransaction(tx => tx.objectStore(store).get<T>(key), store, 'readonly')
  }

  getRange<T> (store: string, keys: IDBKeyRange) {
    return this.withTransaction(tx => tx.objectStore(store).getRange<T>(keys), store, 'readonly')
  }

  put (store: string, value: any, key: IDBValidKey) {
    return this.withTransaction(tx => tx.objectStore(store).put(value, key), store, 'readwrite')
  }

  delete (store: string, key: IDBValidKey) {
    return this.withTransaction(tx => tx.objectStore(store).delete(key), store, 'readwrite')
  }

  clear (store: string) {
    return new Promise((resolve, reject) => {
      const req = this.db.transaction(store, 'readwrite').objectStore(store).clear()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  keys (store: string) {
    return new Promise<IDBValidKey[]>((resolve, reject) => {
      const req = this.db.transaction(store, 'readonly').objectStore(store).getAllKeys()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  values<T> (store: string) {
    return new Promise<T[]>((resolve, reject) => {
      const req = this.db.transaction(store, 'readonly').objectStore(store).getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  has (store: string, key: IDBValidKey) {
    return new Promise<boolean>((resolve, reject) => {
      const req = this.db.transaction(store, 'readonly').objectStore(store).get(key)
      req.onsuccess = () => resolve(!!req.result)
      req.onerror = () => reject(req.error)
    })
  }
}

export class IDB {
  static async open (name: string, version: number, upgrader?: (db: IDBDatabase) => void) {
    return new Promise<Database>((resolve, reject) => {
      const req = window.indexedDB.open(name, version)
      req.onupgradeneeded = () => {
        if (upgrader) {
          upgrader(req.result)
        }
      }
      req.onsuccess = () => resolve(new Database(req.result))
      req.onerror = () => reject(req.error)
    })
  }
}
