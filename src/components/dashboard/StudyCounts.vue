<template>
  <v-card>
    <v-container v-if="isLoading">
      <v-skeleton-loader type="text,text,text" />
    </v-container>
    <v-container v-else fluid>
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
</template>

<script lang="ts">
  import Vue from 'vue'
import { adminInst } from '../../services/http/AxiosInstance'

  export default Vue.extend({
    name: 'StudyCounts',
    props: {
      study: String
    },
    data () {
      return {
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
          const res = await adminInst.get(`study/${this.study}/dashboard/counts`)
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