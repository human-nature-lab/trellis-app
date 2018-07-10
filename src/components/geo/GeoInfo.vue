<template>
  <v-container fluid>
    <v-layout column>
      <v-alert v-if="error">{{error}}</v-alert>
      <h1>
        {{translated}}
      </h1>
      <div>
        <GeoBreadcrumbs :geo-id="geo.parent_id" />
      </div>
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
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  import singleton from '../../static/singleton'
  import index from '../../router/index'
  import {merge} from 'lodash'

  let geo = {}
  function loadGeo (id) {
    let loading = singleton.loading
    loading.active = true
    loading.message = `Loading location ${id}...`
    loading.indeterminate = true
    console.log('loading geo', id)
    return GeoService.getGeoById([id]).then(g => {
      merge(geo, g) // Must merge so that vue can react to changes. Can't reassign because we break the reference in the view
      loading.active = false
      return geo
    }).catch(err => {
      singleton.loading.error = err
    })
  }
  export default {
    name: 'geo-info',
    components: {GeoBreadcrumbs},
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
      loadGeo(to.params.geoId).finally(next)
    },
    methods: {
      viewRespondents () {
        index.push({
          name: 'RespondentsSearch',
          query: {
            filters: JSON.stringify({
              geos: [this.geo.id],
              include_children: true
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
