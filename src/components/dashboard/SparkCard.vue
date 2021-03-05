<template>
  <v-card>
    <v-subheader>{{title}}</v-subheader>
    <v-progress-circular v-if="isLoading" indeterminate ref=""/>
    <v-sparkline
      v-else
      auto-draw
      :value="values" />
  </v-card>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { homogenizeDates } from '../../classes/HomogenizeDates'

  type SparkData = {
    labels: string[],
    data: number[]
  }

  export default Vue.extend({
    name: 'SparkCard',
    props: {
      load: Function,
      title: String,
      type: {
        type: String,
        default: 'trend'
      },
      cumlative: {
        type: Boolean,
        default: false
      },
    },
    data () {
      return {
        isLoading: false,
        error: null,
        data: { labels: [], data: [] } as SparkData
      }
    },
    created () {
      this.runLoad()
    },
    methods: {
      async runLoad() {
        this.isLoading = true
        try {
          this.data = await this.load()
        } catch (err) {
          this.error = err
        } finally {
          this.isLoading = false
        }
      }
    },
    computed: {
      filledData (): SparkData {
        return this.isLoading ? this.data : homogenizeDates(this.data) 
      },
      values (): number[] {
        return this.filledData.data
      }
    }
  })
</script>

<style lang="sass">
  
</style>