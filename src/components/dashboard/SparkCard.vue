<template>
  <v-card>
    <v-subheader>
      <slot name="title" />
      <v-spacer />
      <v-btn 
        v-if="values.length"
        :disabled="loading"
        icon
        @click="asTable = !asTable">
        <v-icon v-if="asTable" small>mdi-chart-line</v-icon>
        <v-icon v-else small>mdi-table</v-icon>
      </v-btn>
    </v-subheader>
    <v-skeleton-loader
      v-if="loading"
      type="image" />
    <v-col v-else-if="!values.length">
      {{$t('no_matching_data')}}
    </v-col>
    <v-col v-else-if="asTable">
      <v-data-table
        dense
        :items="series"
        :headers="[{ text: 'Date', value: 'date'}, { text: 'Count', value: 'value' }]"
        />
    </v-col>
    <v-sparkline
      v-else
      auto-draw
      :labels="filledData.labels"
      line-width="0"
      fill
      :value="values">
      <template #label="item">
        {{labelMask[item.index] ? item.value : ''}}
      </template>
    </v-sparkline>
  </v-card>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import { homogenizeDates } from '../../classes/HomogenizeDates'
  
  export type SparkData = {
    labels: string[],
    data: number[]
  }

  export default Vue.extend({
    name: 'SparkCard',
    props: {
      min: String,
      max: String,
      numLabels: {
        type: Number,
        default: 5
      },
      loading: {
        type: Boolean,
        default: false
      },
      value: Array as PropOptions<number[]>,
      labels: Array as PropOptions<string[]>,
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
        asTable: false
      }
    },
    computed: {
      filledData (): SparkData {
        return this.loading ? { data: [], labels: [] } : homogenizeDates({ data: this.value, labels: this.labels }, this.min, this.max) 
      },
      dates (): string[] {
        return this.filledData.labels
      },
      values (): number[] {
        return this.filledData.data
      },
      labelMask(): boolean[] {
        const data = this.filledData
        const mask = new Array(data.data.length).fill(false)
        const diff = Math.ceil(mask.length / this.numLabels)
        const offset = Math.floor(diff / 2)
        for (let i = 0; i < mask.length; i++) {
          if (i % diff === offset) {
            mask[i] = true
          }
        }
        return mask
      },
      series (): { value: number, date: string}[] {
        return this.labels.map((date, i) => ({
          date,
          value: this.value[i]
        }))
      }
    }
  })
</script>

<style lang="sass">
  
</style>