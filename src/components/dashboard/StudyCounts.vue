<template>
  <v-card>
    <v-container fluid class="pa-2">
      <v-row>
        <v-col
          cols="4"
          lg="2"
          v-for="(count, title) in sections"
          :key="title"
          class="py-4">
          <v-skeleton-loader  v-if="isLoading" type="text,text" />
          <div v-else>
            <h4 class="text-center">
              {{title}}
            </h4>
            <div class="text-center">
              {{count}}
            </div>
          </div>
        </v-col>
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
    },
    computed: {
      sections () {
        return {
          [this.$t('surveys')]: this.counts.surveys,
          [this.$t('respondents')]: this.counts.respondents,
          [this.$t('locations')]: this.counts.geos,
          [this.$t('photos')]: this.counts.photos,
          [this.$t('users')]: this.counts.users,
          [this.$t('forms')]: this.counts.forms,
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>