import { Route } from 'vue-router'
import Vue from 'vue'

export const QueryPersistMixin = Vue.extend({
  methods: {
    beforeRouteUpdate () {
      // @ts-ignore
      this.$forceUpdate()
    },
    readQueryState (...keys: string[]) {
      for (const key of keys) {
        if (this.$route && this.$route.query && this.$route.query.hasOwnProperty(key)) {
          if (Array.isArray(this[key]) && typeof this[key] !== 'string' && this[key].length) {
            this[key] = this.$route.query[key].split(',')
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
          } else {
            query[key] = this[key]
          }
        }
      }
      const state = {
        name: r.name,
        params: r.params,
        query: Object.assign(r.query, query)
      }
      console.log('updating state', state)
      this.$router.push(state)
    }
  }
})