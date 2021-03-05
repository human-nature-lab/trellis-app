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
      No data for these dates
    </v-col>
    <v-col v-else-if="asTable">
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th>
                Date
              </th>
              <th>
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(date, i) in labels" :key="date">
              <td>{{date}}</td>
              <td>{{value[i]}}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
    <v-sparkline
      v-else
      auto-draw
      :labels="filledData.labels"
      smooth
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
      title: String,
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
      }
    }
  })
</script>

<style lang="sass">
  
</style>