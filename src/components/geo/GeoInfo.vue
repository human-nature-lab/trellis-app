<template>
  <v-container fluid>
    <v-card tile>
      <v-toolbar card prominent>
        <v-toolbar-title>{{ $t('geo') }}: {{translated}}</v-toolbar-title>
        <v-spacer />
        <v-btn @click="viewRespondents">
          {{ $t('respondents') }}
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-alert v-show="error" color="error">{{error}}</v-alert>
        <v-layout>
          <GeoBreadcrumbs :geo-id="geo.parent_id" />
        </v-layout>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('photos') }}
          </v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            <Photo
              v-for="photo in geo.photos"
              :is-contained="true"
              :height="250"
              :width="250"
              :key="photo.id"
              :photo="photo"/>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  import TranslationMixin from '../../mixins/TranslationMixin'
  import GeoService from '../../services/geo/GeoService'
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  import Photo from '../Photo'
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
    components: {GeoBreadcrumbs, Photo},
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
