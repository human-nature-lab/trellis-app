<template>
  <v-flex>
    <v-card>
      <v-container>
        <v-progress-linear
          v-if="isDownloading"
          :value="downloadProgress" />
        <v-layout>
          <v-spacer />
          <v-btn
            :disabled="!hasSelectedReports || isDispatching"
            @click="dispatchReports">
            <v-progress-circular
              :size="20"
              v-if="isBusy"
              indeterminate />
            {{$t('start_reports')}} ({{selected.length}})
          </v-btn>
          <v-btn
            :disabled="isDownloading"
            @click="downloadReports">
            {{$t('download_latest')}} ({{reportsToDownload.length}})
          </v-btn>
        </v-layout>
      </v-container>
      <v-container>
        <v-card>
          <v-data-table
            v-model="selectedReports"
            :items="reports"
            :loading="isLoading" />
        </v-card>
      </v-container>
      <v-container>
        <v-card>
          <DataImport />
        </v-card>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import DataImport from '../components/reports/DataImport.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import StudyReports from '../components/reports/StudyReports.vue'
  import FormReports from '../components/reports/FormReports.vue'
  import global from '../static/singleton'
  import Vue from 'vue'
  import ReportService from '../services/report/ReportService'
  import Report from '../entities/web/Report'
  import { saveAs } from 'file-saver'

  interface HasReport {
    [key: string]: any
    report?: Report
  }

  enum ReportStatus {
    saved = 'saved',
    queued = 'queued',
    failed = 'failed'
  }

  export default Vue.extend({
    name: 'Reports',
    mixins: [ DocsLinkMixin('reports/Introduction') ],
    components: {
      StudyReports,
      FormReports,
      DataImport
    },
    data () {
      return {
        global,
        isLoading: false,
        isDownloading: false,
        downloadProgress: 0,
        selectedStudyTypes: [],
        selectedReports: [],
        reports: []
      }
    },
    created () {
      this.loadLatestReports()
    },
    methods: {
      async loadLatestReports (): Promise<void> {
        this.isLoading = true
        try {
          this.reports = await ReportService.getAvailableReports()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.log(err)
            this.alert('error', 'Unable to load latest reports')
          }
        } finally {
          this.startPolling()
          this.isLoading = false
        }
      },
      async dispatchReports (): Promise<void> {
        this.isDispatching = true
        try {
          const reports = await ReportService.dispatchReports(this.global.study.id, this.reportTypes, this.formIds)
          this.mergeReportsByType(reports)
          this.startPolling()
          this.clearSelected()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.log(err)
            this.alert('error', this.$t('error'))
          }
        } finally {
          this.isDispatching = false
        }
      },
      clearSelected () {
        this.selectedReports = []
      },
      startPolling (): void {
        // TODO: Poll for the status of queued reports
        const poll = async () => {
          if (this.queuedReports.length) {
            this.isPolling = true
            try {
              const reports = await ReportService.getReports(this.global.study.id, this.queuedReports.map(r => r.id))
              this.mergeReports(reports)
              if (this.queuedReports.length) {
                setTimeout(poll, this.pollingRate)
              } else {
                this.isPolling = false
              }
            } catch (err) {
              this.isPolling = false
              if (this.isNotAuthError(err)) {
                throw err
              }
            }
          } else {
            this.isPolling = false
          }
        }
        if (!this.isPolling) {
          poll()
        }
      },
      async downloadReports () {
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
      isBusy (): boolean {
        return this.isPolling || this.isDispatching || this.isDownloading
      },
      reportsToDownload (): Report[] {
        if (this.hasSelectedReports) {
          return this.selected.filter(o => !!o.report && !!o.report.id && o.report.status === ReportStatus.saved).map(o => o.report)
        } else {
          return this.reports
        }
      },
      queuedReports (): Report[] {
        return this.reports.filter(r => r.status === ReportStatus.queued)
      },
      selected (): HasReport[] {
        return this.selectedForms ? this.selectedForms.concat(this.selectedStudyTypes) : []
      },
      formIds (): string[] {
        return this.selectedForms.map(f => f.id)
      },
      reportTypes (): string[] {
        return this.selectedStudyTypes.map(s => s.value)
      },
      hasSelectedReports (): boolean {
        return !!this.selectedStudyTypes || !!this.selectedStudyTypes.length || !!this.selectedForms.length
      }
    }
  })
</script>
