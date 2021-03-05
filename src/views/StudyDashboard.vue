<template>
  <v-col>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            {{global.study.name}}
            <v-spacer />
            <v-btn
              icon
              :loading="isLoading"
              @click="load">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
          </v-card-title>
          <v-container>
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
      <v-col cols="6">
        <SparkCard
          title="Users"
          :load="() => loadDateSet('users')" />
      </v-col>
      <v-col cols="6">
        <SparkCard
          title="Respondents"
          type="bar"
          :load="() => loadDateSet('respondents')" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <SparkCard
          title="Surveys"
          :load="() => loadDateSet('surveys')" />
      </v-col>
      <v-col>
        <SparkCard
          title="Geos"
          :load="() => loadDateSet('geos')" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../static/singleton'
  import { adminInst } from '../services/http/AxiosInstance'
  import SparkCard from '../components/dashboard/SparkCard.vue'

  export default Vue.extend({
    name: 'StudyDashboard',
    components: { SparkCard },
    data () {
      return {
        global,
        min: '2018-01-01',
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
      },
      async loadDateSet (key: string) {
        const res = await adminInst.get(`study/${this.global.study.id}/dashboard/${key}`, {
          params: {
            min: this.min,
          }
        })
        return res.data
      }
    }
  })
</script>

<style lang="sass">
  
</style>