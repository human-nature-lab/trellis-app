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
          <GeoBreadcrumbs v-if="geo.parentId" :geo-id="geo.parentId"></GeoBreadcrumbs>
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

<script lang="ts">
  // @ts-ignore
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  // @ts-ignore
  import Photo from '../Photo'

  import TranslationMixin from '../../mixins/TranslationMixin'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import GeoService from '../../services/geo/GeoService'
  import router from '../../router'
  import {Route} from 'vue-router'
  import Geo from '../../entities/trellis/Geo'
  import Translation from "../../entities/trellis/Translation"
  import Vue from 'vue'

  export default Vue.extend({
    name: 'geo-info',
    mixins: [
      RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
      TranslationMixin
    ],
    components: {GeoBreadcrumbs, Photo},
    data () {
      return {
        geo: new Geo(),
        translation: new Translation(),
        error: null
      }
    },
    methods: {
      hydrate (geo: Geo) {
        this.geo = geo
        console.log('GeoInfo', geo)
        this.translation = geo.nameTranslation
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
  })
</script>
