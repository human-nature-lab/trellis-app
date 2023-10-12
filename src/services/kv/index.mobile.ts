import KV from '@/entities/trellis/KV'
import DatabaseService from '../database/'
import { Connection, Repository, SaveOptions } from 'typeorm'

export class KVStore {
  async get (namespace: string, key: string) {
    const repo = await DatabaseService.getRepository(KV)
    const res = await repo.findOne({
      where: {
        namespace,
        key,
      },
    })
    return res ? res.value : null
  }

  async set (namespace: string, key: string, value: string) {
    if (key.length > 255) {
      throw new Error('Key is too large')
    } else if (namespace.length > 255) {
      throw new Error('Namespace is too large')
    }
    const db: Connection = await DatabaseService.getDatabase()
    const q = 'INSERT INTO `kv` (`namespace`, `key`, `value`, `created_at`, `updated_at`) ' +
      'VALUES (?, ?, ?, datetime("now"), datetime("now")) ' +
      'ON CONFLICT (`namespace`, `key`) DO UPDATE SET `value` = excluded.value, `updated_at` = datetime("now")'
    await db.query(q, [namespace, key, value])
  }

  async remove (namespace: string, key: string) {
    const repo = await DatabaseService.getRepository(KV)
    const res = await repo.delete({
      namespace,
      key,
    })
    return res
  }

  async clearNamespace (namespace: string) {
    const repo = await DatabaseService.getRepository(KV)
    const res = await repo.delete({
      namespace,
    })
    return res
  }
}

export class NamespaceStore {
  constructor (private kvStore = new KVStore(), public namespace: string) {}

  async get (key: string) {
    return this.kvStore.get(this.namespace, key)
  }

  async set (key: string, value: string) {
    return this.kvStore.set(this.namespace, key, value)
  }

  async remove (key: string) {
    return this.kvStore.remove(this.namespace, key)
  }

  async clear () {
    return this.kvStore.clearNamespace(this.namespace)
  }
}

export default new KVStore()
