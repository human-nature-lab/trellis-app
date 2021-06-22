import { Route } from 'vue-router'
import Vue from 'vue'
import { routeQueue } from '../router'
import { isEqual } from 'lodash'

export const QueryPersistMixin = Vue.extend({
  methods: {
    beforeRouteUpdate () {
      // @ts-ignore
      this.$forceUpdate()
    },
    readQueryState (...keys: string[]) {
      for (const key of keys) {
        if (this.$route && this.$route.query && this.$route.query.hasOwnProperty(key)) {
          if (Array.isArray(this[key]) && this.$route.query[key].length) {
            this[key] = this.$route.query[key].split(',')
          } else if (typeof this[key] === 'boolean') {
            this[key] = !!this.$route.query[key]
          } else {
            this[key] = this.$route.query[key]
          }
        }
      }
    },
    updateQueryState (...keys: string[]) {
      const r: Route = this.$route
      let query = {}
      for (const key of keys) {
        if (this.hasOwnProperty(key)) {
          if (Array.isArray(this[key]) && this[key].length) {
            query[key] = this[key].join(',')
          } else if (typeof this[key] === 'boolean') {
            query[key] = this[key] ? 1 : 0
          } else {
            query[key] = this[key]
          }
        }
      }
      const oldState = {
        name: r.name,
        params: r.params,
        query: r.query
      }
      const state = {
        name: r.name,
        params: Object.assign({}, r.params),
        query: Object.assign({}, r.query, query)
      }
      if (!isEqual(oldState, state)) {
        routeQueue.replace(state)
        console.log('updating state', JSON.stringify(state))
      } else {
        console.log('skipping redundant state', JSON.stringify(state))
      }
    }
  }
})