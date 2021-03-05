<template>
  <v-col>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            {{global.study.name}}
            <v-spacer />
            Date range:
            <v-dialog width="300">
              <template #activator="{ on, attrs }">
                <v-btn text v-on="on" v-bind="attrs">{{min}}</v-btn>
              </template>
              <v-date-picker v-model="min" />
            </v-dialog>
            <v-dialog width="300">
              <template #activator="{ on, attrs }">
                <v-btn text v-on="on" v-bind="attrs">{{max}}</v-btn>
              </template>
              <v-date-picker v-model="max" />
            </v-dialog>
            <v-btn
              icon
              :loading="isLoading"
              @click="load">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
          </v-card-title>
          <v-container fluid>
            <v-row>
              <v-col>Users: {{counts.users}}</v-col>
              <v-col>Surveys: {{counts.geos}}</v-col>
            </v-row>
            <v-row>
              <v-col>Respondents: {{counts.respondents}}</v-col>
              <v-col>Geos: {{counts.geos}}</v-col>
            </v-row>
            <v-row>
              <v-col>Forms: {{counts.forms}}</v-col>
              <v-col>Photos: {{counts.photos}}</v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <SparkCard
          title="Users"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="users" />
      </v-col>
      <v-col cols="12" md="6">
        <SparkCard
          title="Respondents"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="respondents" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <SparkCard
          title="Surveys"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="surveys" />
      </v-col>
      <v-col cols="12" md="6">
        <SparkCard
          title="Geos"
          :min="min"
          :max="max"
          :study="global.study.id"
          data-key="geos" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../static/singleton'
  import { adminInst } from '../services/http/AxiosInstance'
  import SparkCard from '../components/dashboard/SparkCard.vue'
  import moment from 'moment'

  export default Vue.extend({
    name: 'StudyDashboard',
    components: { SparkCard },
    data () {
      const today = moment()
      return {  
        global,
        min: today.clone().subtract(1, 'year').format('YYYY-MM-DD'),
        max: today.format('YYYY-MM-DD'),
        isLoading: false,
        counts: {
          users: 0,
          respondents: 0,
          surveys: 0,
          forms: 0,
          geos: 0,
          photos: 0
        }
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        this.isLoading = true
        try {
          const res = await adminInst.get(`study/${this.global.study.id}/dashboard/counts`)
          this.counts = res.data
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>