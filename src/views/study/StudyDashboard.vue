<template>
  <v-col>
    <v-row class="mb-12">
      <v-col>
        <StudyCounts :study="global.study.id" />
      </v-col>
    </v-row>
    <v-row class="px-1">
      <div class="pa-2">
        Dates:
      </div>
      <v-dialog v-model="showDates" width="300">
        <template #activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" class="mx-2">
            {{min}} 
            <v-icon small class="mx-2">mdi-arrow-right</v-icon>
            {{max}}
          </v-btn>
        </template>
        <v-date-picker
          v-model="dates"
          range
          @change="dateChange" />
      </v-dialog>

    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Respondents"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="respondents" />
      </v-col>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Surveys"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="surveys" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Users"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="users" />
      </v-col>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Locations"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="geos" />
      </v-col>
    </v-row>
    <v-row class="mt-16">
      <DashboardForms 
        :min="min"
        :max="max"
        :locale="global.locale"
        :study="global.study.id" />
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import moment from 'moment'
  import global from '@/static/singleton'
  import SparkLoader from '@/components/dashboard/SparkLoader.vue'
  import StudyCounts from '@/components/dashboard/StudyCounts.vue'
  import DashboardForms from '@/components/dashboard/DashboardForms.vue'
  import { QueryPersistMixin } from '@/mixins/QueryPersistMixin'

  export default Vue.extend({
    name: 'StudyDashboard',
    mixins: [QueryPersistMixin],
    components: { SparkLoader, DashboardForms, StudyCounts },
    data () {
      const today = moment()
      return {  
        global,
        showDates: false,
        dates: [today.clone().subtract(1, 'year').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
        persistKeys: ['dates']
      }
    },
    created () {
      this.readQueryState(...this.persistKeys)
    },
    methods: {
      dateChange () {
        console.log('dateChange')
        this.showMin = false
        this.showMax = false
        this.updateQueryState(...this.persistKeys)
      }
    },
    computed: {
      min (): string {
        return this.dates[0]
      },
      max (): string {
        return this.dates[1]
      }
    }
  })
</script>
