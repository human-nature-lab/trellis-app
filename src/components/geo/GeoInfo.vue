<template>
  <v-flex xs12>
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
        <v-layout class="pa-3">
          <GeoBreadcrumbs v-if="geo.parentId" :geo-id="geo.parentId"></GeoBreadcrumbs>
        </v-layout>
        <v-layout>
          <PhotoAlbum :photos="geo.photos" @photo="addPhoto"/>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  // @ts-ignore
  import PhotoAlbum from '../photo/PhotoAlbum'
  import Photo from '../../entities/trellis/Photo'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import GeoService from '../../services/geo/GeoService'
  import router from '../../router'
  import {Route} from 'vue-router'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'

  export default Vue.extend({
    name: 'geo-info',
    mixins: [
      RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
      TranslationMixin
    ],
    components: {GeoBreadcrumbs, PhotoAlbum},
    data () {
      return {
        geo: null,
        translation: null,
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
      },
      async addPhoto (photo: Photo) {
        await GeoService.addPhoto(this.geo.id, photo)
        this.geo.photos.push(photo)
      }
    }
  })
</script>
