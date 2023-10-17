<script setup lang="ts">
import { Report } from './useReports'
defineProps<{
  report: Report
}>()
</script>

<template>
  <v-simple-table v-if="report">
    <thead>
      <tr>
        <th>Respondent Id</th>
        <th>Kept</th>
        <th>Given</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in report.rows"
        :key="row.respondentId"
      >
        <td>{{ row.respondentId }}</td>
        <td>{{ row.kept }}</td>
        <td>{{ row.given }}</td>
        <td>{{ row.total }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style lang="sass">

</style>
