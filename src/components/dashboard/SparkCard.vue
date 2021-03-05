<template>
  <v-card>
    <v-subheader>{{title}}</v-subheader>
    <v-progress-circular v-if="isLoading" indeterminate />
    <v-col v-else-if="!values.length">
      No data for these dates
    </v-col>
    <v-sparkline
      v-else
      auto-draw
      :value="values" />
  </v-card>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { homogenizeDates } from '../../classes/HomogenizeDates'
  import { adminInst } from '../../services/http/AxiosInstance'

  type SparkData = {
    labels: string[],
    data: number[]
  }

  export default Vue.extend({
    name: 'SparkCard',
    props: {
      title: String,
      dataKey: String,
      study: String,
      min: String,
      max: String,
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
      this.load()
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
        return this.isLoading ? this.data : homogenizeDates(this.data, this.min, this.max) 
      },
      values (): number[] {
        return this.filledData.data
      }
    }
  })
</script>

<style lang="sass">
  
</style>