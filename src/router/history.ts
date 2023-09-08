import { LinkedList } from '@/core/LinkedList'
import { LocalStorage, NamespaceStorage } from '@/core/storage'
import { Mutex } from 'async-mutex'

type MinimalRoute = {
  title?: string
  path: string
  query?: Record<string, any>
  params?: Record<string, any>
}

export class History {
  public items = new LinkedList<MinimalRoute>()
  private storage = new NamespaceStorage('history', new LocalStorage())
  private isInitialized = false
  private mut = new Mutex()

  constructor () {
    this.init()
  }

  private init () {
    return this.mut.runExclusive(async () => {
      if (this.isInitialized) {
        return
      }
      const items = await this.storage.items<MinimalRoute>()
      for (const item of items) {
        this.items.push(item)
      }
      this.isInitialized = true
    })
  }

  push (route: MinimalRoute) {
    this.items.push(route)
    this.storage.
  }

  unshift () {

  }

  clear () {

  }

  replace () {

  }
}
