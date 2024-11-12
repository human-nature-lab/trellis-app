import KV, { NamespaceStore } from '../../src/services/kv/index.mobile'
import { expect } from 'chai'

export default function () {
  describe('KVStore', function () {
    after(async () => {
      await KV.clearNamespace('test')
    })
    it('should get and set values', async () => {
      await KV.set('test', 'key', 'value')
      const value = await KV.get('test', 'key')
      expect(value).to.equal('value')
    })
    it('should remove values', async () => {
      await KV.set('test', 'key', 'value')
      await KV.remove('test', 'key')
      const value = await KV.get('test', 'key')
      expect(value).to.be.null
    })
    it('should clear namespaces', async () => {
      await KV.set('test', 'key', 'value')
      await KV.clearNamespace('test')
      const value = await KV.get('test', 'key')
      expect(value).to.be.null
    })
    it('should handle large values', async () => {
      const value = 'x'.repeat(65535)
      await KV.set('test', 'large', value)
      const res = await KV.get('test', 'large')
      expect(res).to.equal(value)
    })
    it('should fail when key is too large', async () => {
      const key = 'x'.repeat(65536)
      try {
        await KV.set('test', key, 'value')
        expect(true).to.equal(false, 'Should have thrown an error')
      } catch (err) {
        expect(err.message).to.equal('Key is too large')
      }
    })
    it('should faile when namespace is too large', async () => {
      const namespace = 'x'.repeat(65536)
      try {
        await KV.set(namespace, 'key', 'value')
        expect(true).to.equal(false, 'Should have thrown an error')
      } catch (err) {
        expect(err.message).to.equal('Namespace is too large')
      } finally {
        await KV.clearNamespace(namespace)
      }
    })
  })

  describe('NamespaceStore', function () {
    after(async () => {
      await KV.clearNamespace('test')
    })
    it('should get and set values', async () => {
      const kv = new NamespaceStore(KV, 'test')
      await kv.set('key', 'value')
      const value = await kv.get('key')
      expect(value).to.equal('value')
    })
    it('should remove values', async () => {
      const kv = new NamespaceStore(KV, 'test')
      await kv.set('key', 'value')
      await kv.remove('key')
      const value = await kv.get('key')
      expect(value).to.be.null
    })
    it('should clear', async () => {
      const kv = new NamespaceStore(KV, 'test')
      await kv.set('key', 'value')
      await kv.clear()
      const value = await kv.get('key')
      expect(value).to.be.null
    })
  })
}
