<template>
 <SparkCard
  v-intersect="onIntersect"
  :value="data.data"
  :min="min"
  :max="max"
  :labels="data.labels"
  :loading="isLoading">
  <template #title>
    {{title}}
  </template>
</SparkCard>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { adminInst } from '../../services/http/AxiosInstance'
  import SparkCard, { SparkData } from './SparkCard.vue'

  export default Vue.extend({
    name: 'SparkLoader',
    components: { SparkCard },
    props: {
      title: String,
      dataKey: String,
      study: String,
      min: String,
      max: String
    },
    data () {
      return {
        isLoading: false,
        hasLoaded: false,
        data: { labels: [], data: [] } as SparkData
      }
    },
    watch: {
      min () {
        this.$nextTick(this.load)
      },
      max () {
        this.$nextTick(this.load)
      }
    },
    methods: {
      async load () {
        if (!this.min || !this.max) return
        this.isLoading = true
        try {
          const res = await adminInst.get(`study/${this.study}/dashboard/${this.dataKey}`, {
            params: {
              min: this.min,
              max: this.max
            }
          })
          this.data = res.data
        } finally {
          this.isLoading = false
        }
      },
      onIntersect (entries: { isIntersecting: boolean }[]) {
        if (this.hasLoaded) return
        if (entries[0].isIntersecting) {
          this.load()
          this.hasLoaded = true
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>