<template>
  <component :is="tag">
    <v-progress-circular v-if="loading" indeterminate />
    <slot v-else :value="value" />
  </component>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'

  export default Vue.extend({
    name: 'AsyncDataFetcher',
    props: {
      tag: {
        type: String,
        default: 'span'
      },
      id: String,
      fetcher: Function as PropOptions<() => any>
    },
    data () {
      return {
        loading: false,
        value: null
      }
    },
    watch: {
      id (newKey: string, oldKey: string) {
        if (newKey !== oldKey) {
          this.load()
        }
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        console.log('loading', this.key)
        this.loading = true
        try {
          this.value = await this.fetcher()
          this.loading = false
        } catch (err) {
          this.error = err
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>