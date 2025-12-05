<script setup lang="ts">
import ReportTable from '@/components/table/ReportTable.vue'
import { useRoute } from 'vue-router/composables'
import { useReport } from '@/helpers/report.helper'

const route = useRoute()
const { report, loading, ready, error, reload } = useReport(() => route.params.reportName)

</script>

<template>
  <v-container>
    <v-alert
      v-if="error"
      type="error"
      :title="error.message"
    />
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <ReportTable
      v-if="ready"
      :table="report"
    />
    <v-btn
      :disabled="loading"
      @click="reload"
    >
      Reload
    </v-btn>
  </v-container>
</template>
