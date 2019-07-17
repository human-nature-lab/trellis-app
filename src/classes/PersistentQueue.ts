export interface StorageInterface {
  getItem (key: string): any | Promise<boolean>
  setItem (key: string, item: any): boolean | Promise<boolean>
  removeItem (key: string): any | Promise<boolean>
}

interface Metadata {
  startIndex: number
  endIndex: number
}

type SafeAccessCallback<T> = (item: T) => PromiseLike<any> | any

/**
 * Queue datastructure backed by persistent storage
 */
export default class PersistentQueue<T> {

  private metaKey: string

  constructor (private key: string, private storage: StorageInterface) {
    this.metaKey = this.key + '-metadata'
  }

  /**
   * Get the size of the queue.
   * @param meta
   */
  async size (meta?: Metadata): Promise<number> {
    if (!meta) {
      meta = await this.getMetadata()
    }
    return meta.endIndex - meta.startIndex
  }

  /**
   * Load the entire queue into memory as an array.
   */
  public async asArray (): Promise<T[]> {
    const arr = []
    await this.asyncForEach(item => {
      arr.push(item)
    })
    return arr
  }

  /**
   * Add an item to the queue.
   * @param item
   */
  async push (item: any): Promise<void> {
    const meta = await this.getMetadata()
    const size = await this.size(meta)
    await this.set(size, item, meta)
    meta.endIndex++
    await this.updateMetadata(meta)
  }

  /**
   * Get the next item in the queue. Optionally safely access the next item to do an operation with it. It will not be
   * removed if the callback throws an error or returns false. Generally the callback should be used for safe access.
   * @param callback
   */
  async next (callback?: SafeAccessCallback<T>): Promise<T> {
    const meta = await this.getMetadata()
    const item = await this.get(0, meta)
    let shouldRemove = true
    if (item != null && callback) {
      const res = await callback(item)
      if (res === false) {
        shouldRemove = false
      }
    }
    if (shouldRemove) {
      await this.removeNext(meta)
    }
    return item
  }

  /**
   * Peek at the next item on the queue.
   */
  async peek (): Promise<T> {
    return this.get(0)
  }

  /**
   * Clear the entire queue.
   */
  async clear(): Promise<void> {
    const meta = await this.getMetadata()
    // Remove the metadata about this queue first
    await this.removeMetadata()
    const size = await this.size(meta)

    // Remove each item in the queue. We don't care if there is a power outage and all items aren't removed. They will
    // just be overwritten if there are left over artifacts.
    for (let i = 0; i < size; i++) {
      await this.removeNext(meta)
    }
  }

  /**
   * Iterate over all of the items in the queue. It is not safe to modify the contents of the queue while iterating.
   * @param callback
   */
  public async asyncForEach (callback: (item: T, index: number) => any | PromiseLike<any>) {
    const size = await this.size()
    for (let i = 0; i < size; i++) {
      const item = await this.get(i)
      await callback(item, i)
    }
  }



  private async getMetadata (): Promise<Metadata> {
    const meta = this.storage.getItem(this.metaKey)
    return meta ? meta : {
      startIndex: 0,
      endIndex: 0
    }
  }

  private async updateMetadata (meta: Metadata) {
    await this.storage.setItem(this.metaKey, meta)
  }

  private makeItemKey (meta: Metadata, index: number): string {
    return `${this.key}[${index + meta.startIndex}]`
  }

  private async get (index: number, meta?: Metadata): Promise<T> {
    if (!meta) {
      meta = await this.getMetadata()
    }
    return this.storage.getItem(this.makeItemKey(meta, index))
  }

  private async set (index: number, item: any, meta?: Metadata): Promise<any> {
    if (!meta) {
      meta = await this.getMetadata()
    }
    return this.storage.setItem(this.makeItemKey(meta, index), item)
  }

  private async removeNext (meta?: Metadata): Promise<void> {
    if (!meta) {
      meta = await this.getMetadata()
    }
    meta.startIndex++
    if (meta.startIndex === meta.endIndex) {
      await this.removeMetadata()
    } else {
      await this.updateMetadata(meta)
    }
    await this.storage.removeItem(this.makeItemKey(meta, -1))
  }

  private async removeMetadata (): Promise<void> {
    await this.storage.removeItem(this.metaKey)
  }

}
