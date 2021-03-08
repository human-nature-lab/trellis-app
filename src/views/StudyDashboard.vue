<template>
  <v-col>
    <v-row>
      <v-col cols="12" md="4">
        <h3>
          {{global.study.name}}
        </h3>
      </v-col>
      <v-col cols="12" md="8">
        <v-row>
          <v-spacer />
          <v-dialog v-model="showMin" width="300">
            <template #activator="{ on, attrs }">
              <v-btn v-on="on" v-bind="attrs">
                Start: {{min}}
              </v-btn>
            </template>
            <v-date-picker v-model="min" @change="showMin = false" />
          </v-dialog>
          <v-dialog v-model="showMax" width="300">
            <template #activator="{ on, attrs }">
              <v-btn v-on="on" v-bind="attrs">
                End: {{max}}
              </v-btn>
            </template>
            <v-date-picker v-model="max" @change="showMax = false" />
          </v-dialog>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <StudyCounts :study="global.study.id" />
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
          title="Respondents"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="respondents" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Surveys"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="surveys" />
      </v-col>
      <v-col cols="12" md="6">
        <SparkLoader
          title="Geos"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="geos" />
      </v-col>
    </v-row>
    <v-row>
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
  import global from '../static/singleton'
  import SparkLoader from '../components/dashboard/SparkLoader.vue'
  import StudyCounts from '../components/dashboard/StudyCounts.vue'
  import DashboardForms from '../components/dashboard/DashboardForms.vue'
  import moment from 'moment'

  export default Vue.extend({
    name: 'StudyDashboard',
    components: { SparkLoader, DashboardForms, StudyCounts },
    data () {
      const today = moment()
      return {  
        global,
        showMin: false,
        showMax: false,
        min: today.clone().subtract(1, 'year').format('YYYY-MM-DD'),
        max: today.format('YYYY-MM-DD')
      }
    }
  })
</script>

<style lang="sass">
  
</style>