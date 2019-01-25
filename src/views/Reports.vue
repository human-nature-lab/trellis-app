<template>
  <v-flex>
    <v-card>
      <v-container>
        <v-layout>
          <v-spacer />
          <v-btn
            :disabled="!hasSelectedReports || isBusy"
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
            <v-progress-circular
              :size="20"
              v-if="isDownloading"
              indeterminate />
            {{$t('download_latest')}} ({{reportsToDownload.length}})
          </v-btn>
        </v-layout>
      </v-container>
      <v-container>
        <v-card>
          <StudyReports
            v-model="selectedStudyTypes"
            :reportsAreLoading="isLoading"
            :reports="reports" />
        </v-card>
      </v-container>
      <v-container>
        <v-card>
          <FormReports
            v-model="selectedForms"
            :reportsAreLoading="isLoading"
            :reports="reports"
            :studyId="global.study.id" />
        </v-card>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import StudyReports from '../components/reports/StudyReports'
  import FormReports from '../components/reports/FormReports'
  import global from '../static/singleton'
  import Vue from 'vue'
  import ReportService from "../services/report/ReportService"
  import Report from "../entities/web/Report"
  import {saveAs} from 'file-saver'

  interface HasReport {
    [key: string]: any
    report?: Report
  }

  export default Vue.extend({
    name: 'Reports',
    mixins: [ DocsLinkMixin('reports/Introduction') ],
    components: {
      StudyReports,
      FormReports
    },
    data () {
      return {
        global,
        isLoading: false,
        isBusy: false,
        isDownloading: false,
        selectedStudyTypes: [],
        selectedForms: [],
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
          this.reports = (await ReportService.getLatestReports(this.global.study.id))
        } catch (err) {
          err.component = 'Reports.vue@loadLatestReports'
          this.log(err)
          this.alert('error', 'Unable to load latest reports')
        } finally {
          this.startPolling()
          this.isLoading = false
        }
      },
      async dispatchReports (): Promise<void> {
        this.isBusy = true
        try {
          const reports = await ReportService.dispatchReports(this.global.study.id, this.reportTypes, this.formIds)
          this.updateReports(reports)
        } catch (err) {
          err.component = 'Reports.vue@dispatchReports'
          this.log(err)
          this.alert('error', this.$t('error'))
        } finally {
          this.isBusy = false
        }
      },
      updateReports (reports: Report[]) {
        for (let i = 0; i < reports.length; i++) {
          const report = reports[i]
          const oldReport = this.reports.find(r => r.id === report.id)
          if (oldReport) {
            this.reports.splice(i, 1, oldReport)
          } else {
            this.reports.push(report)
          }
        }
        this.startPolling()
      },
      startPolling (): void {
        // TODO: Poll for the status of queued reports
        for (let report of this.reports) {
          if (report.status === 'queued') {
            // this.isBusy = true
          }
        }
      },
      async downloadReports () {
        this.isDownloading = true
        const reportIds = this.reportsToDownload.map(r => r.id)
        try {
          const blob = await ReportService.getReportsZip(this.global.study.id, reportIds)
          saveAs(blob, 'reports.zip')
        } catch (err) {
          err.component = 'Reports.vue@downloadReports'
          this.log(err)
          this.alert('error', 'Unable to download reports')
        } finally {
          this.isDownloading = false
        }
      }
    },
    computed: {
      reportsToDownload (): Report[] {
        if (this.hasSelectedReports) {
          return this.selected.filter(o => !!o.report && !!o.report.id && o.report.status === 'saved').map(o => o.report)
        } else {
          return this.reports
        }
      },
      selected (): HasReport[] {
        return this.selectedForms.concat(this.selectedStudyTypes)
      },
      formIds (): string[] {
        return this.selectedForms.map(f => f.id)
      },
      reportTypes (): string[] {
        return this.selectedStudyTypes.map(s => s.value)
      },
      hasSelectedReports (): boolean {
        return !!this.selectedStudyTypes.length || !!this.selectedForms.length
      }
    }
  })
</script>
