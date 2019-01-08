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
            <span class="subheading">
              {{ $t('type') }}:
              {{ geo.geoType.name }}
              <permission :role-whitelist="['admin', 'manager']">
                <v-btn
                  icon
                  @click="showGeoTypeDialog = true">
                  <v-icon>edit</v-icon>
                </v-btn>
              </permission>
            </span>
          </v-flex>
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
    <v-dialog
      v-model="showGeoTypeDialog">
      <v-card>
        <geo-type-selector
          v-on:geo-type-selected="onGeoTypeSelected"
          :geoType="geo.geoType">
        </geo-type-selector>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  // @ts-ignore
  import PhotoAlbum from '../photo/PhotoAlbum'
  // @ts-ignore
  import GeoTypeSelector from './GeoTypeSelector'
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'
  // @ts-ignore
  import Permission from '../Permission'
  import Photo from '../../entities/trellis/Photo'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import GeoService from '../../services/geo/GeoService'
  import router from '../../router'
  import {Route} from 'vue-router'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import {SearchFilter} from '../../services/respondent/RespondentServiceInterface'
  import DocsFiles from '../documentation/DocsFiles'

  export default Vue.extend({
    name: 'geo-info',
    mixins: [
      RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
      TranslationMixin,
      DocsLinkMixin(DocsFiles.locations.info)
    ],
    components: {
      GeoBreadcrumbs,
      PhotoAlbum,
      AsyncTranslationText,
      GeoTypeSelector,
      Permission
    },
    data () {
      return {
        geo: null,
        translation: null,
        error: null,
        geoPhotos: [],
        geoPhotosLoading: true,
        showGeoTypeDialog: false
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
      },
      onGeoTypeSelected: async function (geoType) {
        if (geoType.id === this.geo.geoType.id) return
        this.geo.geoTypeId = geoType.id
        this.geo.geoType = geoType
        try {
          GeoService.updateGeo(this.geo)
        } catch (err) {
          console.error(err)
        } finally {
          this.showGeoTypeDialog = false
        }
      }
    }
  })
</script>
