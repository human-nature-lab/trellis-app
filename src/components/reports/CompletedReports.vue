<template>
  <v-data-table
    :loading="isLoading"
    :headers="headers"
    :hide-default-footer="rows.length < 10"
    :disable-pagination="rows.length < 10"
    :items="rows">
    <template #item="{ item: report }">
      <ReportRow
        :report="report"
        :headers="headers" />
    </template>
  </v-data-table>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import global from '../../static/singleton'
  import { Report } from '../../entities/web/Report'
  import { ReportType } from '../../entities/web/ReportType'
  import ReportService from '../../services/report/ReportService'
  import ReportRow from './ReportRow.vue'

  export default Vue.extend({
    name: 'CompletedReports',
    components: { ReportRow },
    props: {
      reportType: {
        type: Object,
        required: true
      } as PropOptions<ReportType>
    },
    data () {
      return {
        global,
        error: null,
        isLoading: false,
        reports: [] as Report[],
        headers: [{
          text: '',
          value: '',
          sortable: false
        }, {
          text: 'Status',
          value: 'status'
        }, {
          text: 'Date',
          value: 'date'
        }, {
          text: 'Files',
          value: 'files'
        }]
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        this.isLoading = true
        try {
          const pageRes = await ReportService.getReportsForType(this.global.study.id, this.reportType.name)
          this.reports = pageRes.data
          // TODO: Paginate this please
        } catch (err) {
          this.error = err
        } finally {
          this.isLoading = false
        }
      },
    },
    computed: {
      rows () {
        return this.reports.map(r => ({
          id: r.id,
          date: r.createdAt.format('YYYY-MMM-DD HH:mm:ss'),
          files: r.files ? r.files.length : 0,
          status: r.status
        }))
      }
    }
  })
</script>

<style lang="sass">
  
</style>