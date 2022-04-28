import LRU from 'lru-cache'
import { roughSizeOf } from '../../classes/M'

export const cache = new LRU({
  max: 1024 * 10000,
  length: function (n, key) {
    return roughSizeOf(n) + roughSizeOf(key)
  },
})
