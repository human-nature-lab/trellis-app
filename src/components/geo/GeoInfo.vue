<template>
  <v-container fluid>
    <v-layout>
      <v-alert v-if="error">{{error}}</v-alert>
      <h1>{{translated}}</h1>
    </v-layout>
    <v-layout>
      Photos
    </v-layout>
    <v-layout>
      <v-btn @click="viewRespondents">
        View Respondents
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
  import TranslationMixin from '../../mixins/TranslationMixin'
  import GeoService from '../../services/geo/GeoService'
  import singleton from '../../static/singleton'
  import index from '../../router/index'

  let geo = null
  function loadGeo (id) {
    let loading = singleton.loading
    loading.active = true
    loading.message = `Loading location ${id}...`
    loading.indeterminate = true
    return GeoService.getGeoById([id]).then(g => {
      geo = g
      loading.active = false
    }).catch(err => {
      singleton.loading.error = err
    })
  }
  export default {
    name: 'geo-info',
    data () {
      return {
        geo: geo,
        translation: geo.name_translation
      }
    },
    beforeRouteEnter (to, from, next) {
      loadGeo(to.params.geoId).finally(next)
    },
    beforeRouteUpdate (to, from, next) {
      debugger
      next()
    },
    methods: {
      viewRespondents () {
        index.push({
          name: 'RespondentsSearch',
          query: {
            filters: JSON.stringify({
              geos: [this.geo.id]
            })
          }
        })
      }
    },
    mixins: [TranslationMixin]
  }
</script>

<style scoped>

</style>
