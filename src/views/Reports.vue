<template>
  <v-container fluid>
    <v-col>
      <v-toolbar >
        <v-toolbar-title>
          Reports
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          text
          :disabled="!selected.length"
          @click="showDispatch = true">
          Run
        </v-btn>
      </v-toolbar>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :loading="isLoading"
        show-select
        show-expand
        item-key="name"
        :hide-default-footer="availableComputed.length < 20"
        :disable-pagination="availableComputed.length < 20"
        :items="availableComputed">
        <template #expanded-item="{ item }">
          <td :colspan="headers.length + 2">
            <CompletedReports
              :reportType="item" />
          </td>
        </template>
      </v-data-table>
    </v-col>
    <DataImport />
    <TrellisModal v-model="showDispatch" title="Run reports">
      <ReportDispatcher
        @close="showDispatch = false"
        @done="load"
        :reports="selected" />
    </TrellisModal>
  </v-container>
</template>

<script lang="ts">
  import DataImport from '../components/reports/DataImport.vue'
  import CompletedReports from '../components/reports/CompletedReports.vue'
  import ReportDispatcher from '../components/reports/ReportDispatcher.vue'
  import TrellisModal from '../components/TrellisModal.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import global from '../static/singleton'
  import Vue from 'vue'
  import ReportService from '../services/report/ReportService'
  import { Report } from '../entities/web/Report'
  import { ReportType } from '../entities/web/ReportType'
  import { saveAs } from 'file-saver'

  export default Vue.extend({
    name: 'Reports',
    mixins: [ DocsLinkMixin('reports/Introduction') ],
    components: {
      DataImport,
      CompletedReports,
      ReportDispatcher,
      TrellisModal
    },
    data () {
      return {
        global,
        isLoading: false,
        showDispatch: false,
        headers: [{
          text: 'Name',
          value: 'name'
        }, {
          text: 'Latest report',
          value: 'latestReportDate'
        }, {
          text: 'Report status',
          value: 'latestReportStatus'
        }],
        availableReports: [] as ReportType[],
        recentReports: [] as Report[],
        selected: [] as ReportType[]
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load (): Promise<void> {
        if (this.isLoading) return
        this.isLoading = true
        this.showDispatch = false
        this.selected = []
        try {
          const availableReports = await ReportService.getAvailableTypes()
          const names = availableReports.map(r => r.name)
          this.recentReports = await ReportService.getLatestReports(this.global.study.id, names)
          this.availableReports = availableReports
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.log(err)
            this.alert('error', 'Unable to load latest reports')
          }
        } finally {
          this.isLoading = false
        }
      },
      async downloadReports (): Promise<void> {
        this.isDownloading = true
        this.downloadProgress = 1
        const reportIds = this.reportsToDownload.map(r => r.id)
        let prevProgress = 0
        let n = 0
        let stepPrediction = 20
        try {
          const blob = await ReportService.getReportsZip(this.global.study.id, reportIds, (progress: ProgressEvent) => {
            let totalEstimate
            if (progress.lengthComputable) {
              this.downloadProgress = 100 * progress.loaded / progress.total
            } else {
              // Here we just try to estimate the current progress using an integrator calibrated for about 20 steps.
              // Nothing fancy, but necessary to do something like this without knowing the total.
              n++
              totalEstimate = progress.loaded + (stepPrediction / n) * ((progress.loaded - prevProgress) / 2)
              this.downloadProgress = 100 * (progress.loaded / totalEstimate)
              prevProgress = progress.loaded
            }
            console.log('progress', this.downloadProgress, progress.loaded, totalEstimate)
          })
          setTimeout(() => {
            saveAs(blob, 'reports.zip')
            this.isDownloading = false
          }, 1000)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            err.component = 'Reports.vue@downloadReports'
            this.logError(err, 'Unable to download reports')
          }
        } finally {
          this.isDownloading = false
          this.clearSelected()
        }
      }
    },
    computed: { 
      availableComputed (): object[] {
        return this.availableReports.map(av => {
          const latestReport = this.recentReports.find(r => {
            console.log(av.name, r)
            return r.name === av.name
          })
          console.log('latestReport', latestReport, this.recentReports.length)
          return {
            name: av.name,
            configSchema: av.configSchema,
            latestReportDate: latestReport ? latestReport.createdAt.fromNow() : '',
            latestReportStatus: latestReport ? latestReport.status : ''
          }
        })
      }
    }
  })
</script>
