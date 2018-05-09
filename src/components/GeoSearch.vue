<template>
  <v-card>
    <v-text-input
      v-model="query"
      @change="queryChange"/>
    <v-list>
      <GeoListTile
        v-for="geo in results"
        :geo="geo" />
    </v-list>
  </v-card>
</template>

<script>
  import _ from 'lodash'
  import GeoService from '@/services/geo/GeoService'
  import GeoListTile from './GeoListTile'
  export default {
    name: 'geo-search',
    props: {
      filters: {
        type: Object
      }
    },
    data: function () {
      return {
        query: '',
        results: [],
        queryChange: _.debounce(this.search, 400)
      }
    },
    methods: {
      search: function () {
        GeoService.search(this.query, this.filters).then(results => {
          this.results = results
        })
      }
    },
    components: {
      GeoListTile
    }
  }
</script>

<style scoped>

</style>
