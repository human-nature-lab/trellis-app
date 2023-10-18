<script setup lang="ts">
import { computed } from 'vue'
import { Report } from './useReports'
import { useRespondents } from '@/helpers/respondent.helper'
import { i18n } from '@/i18n'
const props = defineProps<{
  report: Report
}>()

const { respondents, loading, error } = useRespondents(props.report.rows.map(row => row.respondentId))

const nameMap = computed(() => {
  const map: Record<string, string> = {}
  for (const row of props.report.rows) {
    map[row.respondentId] = i18n.t('loading') + ''
  }
  for (const respondent of respondents.value) {
    map[respondent.id] = respondent.getName()
  }
  return map
})

</script>

<template>
  <v-simple-table v-if="report">
    <thead>
      <tr>
        <th>{{ $t('respondent_id') }}</th>
        <th>{{ $t('kept') }}</th>
        <th>{{ $t('received') }}</th>
        <th>{{ $t('total') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in report.rows"
        :key="row.respondentId"
      >
        <td>{{ nameMap[row.respondentId] }}</td>
        <td>{{ row.kept }}</td>
        <td>{{ row.given }}</td>
        <td>{{ row.total }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style lang="sass">

</style>
