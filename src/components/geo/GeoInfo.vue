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
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import GeoService from '../../services/geo/GeoService'
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  import Photo from '../Photo'
  import router from '../../router'

  export default {
    name: 'geo-info',
    mixins: [RouteMixinFactory(r => GeoService.getGeoById(r.params.geoId)), TranslationMixin],
    components: {GeoBreadcrumbs, Photo},
    data () {
      return {
        geo: {},
        translation: {}
      }
    },
    methods: {
      hydrate (geo) {
        this.geo = geo
        this.translation = geo.name_translation
      },
      viewRespondents () {
        router.push({
          name: 'RespondentsSearch',
          query: {
            filters: JSON.stringify({
              geos: [this.geo.id],
              include_children: true
            })
          }
        })
      }
    }
  }
</script>
