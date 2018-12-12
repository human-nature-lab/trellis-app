<template>
  <v-flex xs12>
    <v-card tile>
      <v-toolbar card prominent>
        <v-toolbar-title>{{ $t('geo') }}: <AsyncTranslationText :translation="geo.nameTranslation"></AsyncTranslationText></v-toolbar-title>
        <v-spacer />
        <v-btn @click="viewRespondents">
          {{ $t('respondents') }}
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-alert v-if="error" color="error">{{error}}</v-alert>
        <v-layout class="pa-3">
          <geo-breadcrumbs v-if="geo.parentId" :geo-id="geo.parentId"></geo-breadcrumbs>
        </v-layout>
        <v-layout>
          <photo-album
            :loading="geoPhotosLoading"
            :photos="geoPhotos"
            @photo="addPhoto"
            @delete-photo="onDeletePhoto"
            @update-photos="onUpdatePhotos"></photo-album>
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
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'
  import Photo from '../../entities/trellis/Photo'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import GeoService from '../../services/geo/GeoService'
  import router from '../../router'
  import {Route} from 'vue-router'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import {SearchFilter} from "../../services/respondent/RespondentServiceInterface"

  export default Vue.extend({
    name: 'geo-info',
    mixins: [
      RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
      TranslationMixin
    ],
    components: {GeoBreadcrumbs, PhotoAlbum, AsyncTranslationText},
    data () {
      return {
        geo: null,
        translation: null,
        error: null,
        geoPhotos: [],
        geoPhotosLoading: true
      }
    },
    methods: {
      hydrate: async function (geo: Geo) {
        this.geo = geo
        this.translation = geo.nameTranslation
        this.geoPhotos = await GeoService.getGeoPhotos(geo.id)
        this.geoPhotosLoading = false
      },
      viewRespondents () {
        router.push({
          name: 'RespondentsSearch',
          query: {
            filters: JSON.stringify({
              geos: [this.geo.id],
              includeChildren: true
            } as SearchFilter)
          }
        })
      },
      async addPhoto (photo: Photo) {
        let photoWithPivotTable = await GeoService.addPhoto(this.geo.id, photo)
        this.geoPhotos.push(photoWithPivotTable)
      },
      onUpdatePhotos: async function (photos) {
        await GeoService.updatePhotos(photos)
      },
      onDeletePhoto: async function (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await GeoService.removePhoto(photo)
          this.geoPhotos.splice(this.geoPhotos.indexOf(photo), 1)
        } catch (err) {
          console.error(err)
        }
      }
    }
  })
</script>
