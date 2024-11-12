<script setup lang="ts">
import { ref } from 'vue'
import { ReportStatus } from './useReports'
import ReportTable from './ReportTable.vue'
import TrellisModal from '@/components/TrellisModal.vue'
defineProps<{
  reports: ReportStatus[]
}>()

const reportDialog = ref(false)
const visibleReport = ref<ReportStatus>()

function showReport (report: ReportStatus) {
  visibleReport.value = report
  reportDialog.value = true
}
</script>

<template>
  <v-col>
    <v-list>
      <v-list-item
        v-for="report in reports"
        @click="showReport(report)"
        :key="report.savedAt"
      >
        {{ report.savedAt.toLocaleDateString() }} {{ report.savedAt.toLocaleTimeString() }}
      </v-list-item>
    </v-list>
    <TrellisModal
      v-model="reportDialog"
      :title="visibleReport ? $t('report_title', [visibleReport.savedAt]) : ''"
    >
      <ReportTable
        v-if="visibleReport"
        :report="visibleReport.report"
      />
    </TrellisModal>
  </v-col>
</template>

<style lang="sass">

</style>
