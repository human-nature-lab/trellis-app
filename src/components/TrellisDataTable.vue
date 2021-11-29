<template>
  <v-col>
    <v-row v-if="download">
      <v-spacer />
      <v-btn @click="doDownload">
        {{$t('download')}}
        <v-icon class="ml-2">mdi-download</v-icon>
      </v-btn>
    </v-row>
    <v-data-table
      :items="items"
      :headers="headers"
      v-bind="$attrs"
      v-on="$listeners">
      <template v-for="(_, name) in $scopedSlots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </v-data-table>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Papa from 'papaparse'
  import { saveAs } from 'file-saver'

  export default Vue.extend({
    name: 'TrellisDataTable',
    props: {
      items: Array,
      headers: Array as PropOptions<{text: string, value: string}[]>,
      download: {
        type: Boolean,
        default: false,
      },
      filename: {
        type: String,
        default: 'download.csv'
      },
      allHeaders: {
        type: Boolean,
        default: true,
      }
    },
    methods: {
      doDownload () {
        const config: any = {}
        if (!this.allHeaders) {
          config.columns = this.headers.map(h => h.value)
        }
        const csv = Papa.unparse(this.items, config)
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), this.filename)
      }
    }
  })
</script>

<style lang="sass">
  
</style>