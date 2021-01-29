import LRU from 'lru-cache'

const cacheOptions = {
  max: 50
}

export default new LRU(cacheOptions)
