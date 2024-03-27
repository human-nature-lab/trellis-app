<template>
  <v-flex>
    <table class="table">
      <tr>
        <th>
          {{ $t('name') }}
        </th>
        <th>
          {{ $t('type') }}
        </th>
        <th>
          {{ $t('created_at') }}
        </th>
      </tr>
      <tr v-if="!allConditions.length">
        <td colspan="3">
          {{ $t('no_condition_tags') }}
        </td>
      </tr>
      <tr v-for="condition in allConditions" :key="condition.id">
        <td>{{condition.name}}</td>
        <td>{{condition.type}}</td>
        <td>{{condition.createdAt | relativeTime }}</td>
      </tr>
    </table>
  </v-flex>
</template>

<script>
  import conditionTagStore from './classes/ConditionTagStore'
  import { relativeTime } from '@/filters/date'
  const conditionKeys = ['respondent', 'survey', 'section']
  export default {
    name: 'condition-tag-list',
    filters: { relativeTime },
    props: {
      conditions: {
        validator: function (v) {
          for (let type of conditionKeys) {
            if (!v[type]) {
              return false
            }
          }
          return true
        },
        required: true
      }
    },
    computed: {
      allConditions: function () {
        let conditions = []
        for (let type of ['survey', 'respondent', 'section']) {
          for (let condition of this.conditions[type]) {
            let c = condition.copy()
            c.name = conditionTagStore.getNameFromId(c.conditionId)
            c.type = type
            conditions.push(c)
          }
        }
        return conditions
      }
    }
  }
</script>

<style lang="sass" scoped>
  .table
    td, th
      padding: 10px
      text-align: right
      &:first-child
        text-align: left
</style>
