<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-tabs v-model="selectedTab" :grow="true">
          <v-tab :key="0">Search</v-tab>
          <v-tab :key="1">Map</v-tab>
          <v-tab-item :key="'0'">
            <geo-search></geo-search>
          </v-tab-item>
          <v-tab-item :key="'1'">
            <geo-search-with-map></geo-search-with-map>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import GeoSearchWithMap from './GeoSearchWithMap.vue'
  import GeoSearch from './GeoSearch.vue'

  export default {
    name: 'geo',
    data () {
      return {
        selectedTab: '1'
      }
    },
    props: {},
    components: {
      GeoSearchWithMap,
      GeoSearch
    }
  }
</script>

<style lang="sass">
</style>
