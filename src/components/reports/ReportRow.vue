<template>
  <tr>
    <td style="width: 1px;">
      <v-btn icon @click="download()">
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </td>
    <td v-for="h in headers.slice(1)" :key="h.value">
      {{report[h.value]}}
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import global from '../../static/singleton'
  import { Report } from '../../entities/web/Report'
  import ReportService from '../../services/report/ReportService'
  import { delay } from '../../classes/delay'

  export default Vue.extend({
    name: 'ReportRow',
    props: {
      report: {
        type: Object,
        required: true
      } as PropOptions<Report>,
      headers: {
        type: Array,
        required: true
      } as PropOptions<{ value: string }[]>
    },
    data () {
      return {
        global,
        isDownloading: false
      }
    },
    methods: {
      async download () {
        this.isDownloading = true
        try {
          const blob = await ReportService.getReportsZip(this.global.study.id, [this.report.id])
          await delay(1000)
          saveAs(blob, 'reports.zip')
        } finally {
          this.isDownloading = false
        }        
      }
    }
  })
</script>

<style lang="sass">
  
</style>