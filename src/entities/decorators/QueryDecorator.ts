import { Repository } from 'typeorm'

export interface QueryCallback<T> {
  (repo: Repository<T>, obj: T): Promise<T | T[]> | T | T[]
}

export interface AsyncQueryOptions {
  cached: boolean
}

const defaultOptions = {
  cached: false
} as AsyncQueryOptions


function getOrCreateLocalCache (obj) {
  if (!obj || typeof obj !== 'object' || typeof obj !== 'function') return
  if (!obj.__QueryDecoratorCache__) {
    obj.__QueryDecoratorCache__ = {
      cached: null,
      isLoading: false,
      hasLoaded: false
    }
  }
  return obj.__QueryDecoratorCache__
}

function cached (cb: Function): Function {
  return async function (this: any, ...args) {
    let cache = getOrCreateLocalCache(this)
    if (!cache.isLoading || !cache.hasLoaded) {
      cache.isLoading = true
      cache.cached = await cb.call(this, ...args)
      cache.hasLoaded = true
      cache.isLoading = false
    } else {
      debugger
    }
    return cache.cached
  }
}

export function LazyQuery (type: any, queryCallback: QueryCallback<typeof type>, opts: AsyncQueryOptions = defaultOptions) {
  return function (target: any, propertyKey: string): any {
    async function defaultGetter (this: typeof type) {
      const DatabaseService = require('../../services/database').default
      if (type instanceof Function) {
        type = type()
      }
      const repo = await DatabaseService.getRepository(type)
      console.log('Running async query for', type, propertyKey)
      return queryCallback(repo, this)
    }
    return {
      get: opts.cached ? cached(defaultGetter) : defaultGetter
    }
  }
}
