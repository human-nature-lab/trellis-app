<template>
  <v-flex xs12>
    <v-card tile>
      <v-toolbar card prominent>
        <v-toolbar-title>
          <AsyncTranslationText :translation="geo.nameTranslation" />
        </v-toolbar-title>
        <v-spacer />
        <v-btn @click="viewRespondents">
          {{ $t('respondents') }}
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-alert v-show="error" color="error">{{error}}</v-alert>
        <v-layout wrap class="mb-3">
          <v-flex>
            <span class="subheading">{{ $t('location') }}:</span>  <GeoBreadcrumbs v-if="geo.id" :geoId="geo.id" />
          </v-flex>
          <v-spacer />
          <v-flex class="text-xs-right">
            <span class="subheading">{{ $t('type') }}:</span>  {{geo.geoType.name}}
          </v-flex>
        </v-layout>
        <v-layout>
          <PhotoAlbum
            :photos="geo.photos"
            @photo="addPhoto"
            @deletePhoto="onDeletePhoto"
            @updatePhotos="onUpdatePhotos" />
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
        error: null
      }
    },
    methods: {
      hydrate (geo: Geo) {
        this.geo = geo
        this.translation = geo.nameTranslation
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
        this.geo.photos.push(photoWithPivotTable)
      },
      onUpdatePhotos: async function (photos) {
        await GeoService.updatePhotos(photos)
      },
      onDeletePhoto: async function (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await GeoService.removePhoto(photo)
          this.geo.photos.splice(this.geo.photos.indexOf(photo), 1)
        } catch (err) {
          console.error(err)
        }
      }
    }
  })
</script>
