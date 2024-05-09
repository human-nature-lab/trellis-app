import { Mutex } from 'async-mutex'
import { Database, IDB, ObjectStore } from './idb'

const FS_VERSION = 1

export class FSFile implements WritableStream, ReadableStream {
  constructor (private store: ObjectStore, public path: string) {}
}

export class FileSystem {
  private db: Database
  private store: ObjectStore
  private openMutex = new Mutex()

  constructor (public name: string) {}

  async ready () {
    if (this.db) return
    await this.openMutex.runExclusive(async () => {
      if (this.db) return
      this.db = await IDB.open(this.name + '_fs', FS_VERSION, db => {
        db.createObjectStore('files')
      })
      this.store = this.db.objectStore('files')
    })
    return true
  }

  async open (path: string) {
    await this.ready()
    return new FSFile(this.store, path)
  }
  
  async create (path: string) {
    await this.ready()
    return new FSFile(this.store, path)
  }
}
