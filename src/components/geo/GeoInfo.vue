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
  import router from '../../router/router'
  let geo = null
  let error = null
  function loadGeo (id) {
    return GeoService.getGeosById([id]).then(geos => {
      if (geos.length) {
        geo = geos[0]
      } else {
        throw new Error('Unable to load geo with id ' + id)
      }
    })
  }
  export default {
    name: 'geo-info',
    data () {
      return {
        geo: geo,
        error: error,
        translation: geo.name_translation
      }
    },
    beforeRouteEnter (to, from, next) {
      loadGeo(to.params.geoId)
        .catch(err => {
          error = err
        })
        .finally(next)
    },
    beforeRouteUpdate (to, from, next) {
      debugger
      next()
    },
    methods: {
      viewRespondents () {
        router.push({
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
