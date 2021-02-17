<template>
  <v-flex xs12>
    <v-card>
      <v-container>
        <v-row>
          <v-col cols="12" lg="8">
            <TranslationTextField
              v-if="hasPermission(TrellisPermission.EDIT_GEO)"
              :translation="geo.nameTranslation"
              label="Location name" />
            <AsyncTranslationText
              v-else
              :translation="geo.nameTranslation" />
          </v-col>
          <v-col cols="12" lg="2">
            <v-btn
              @click.stop="showGeoMap">
              Show on map
              <v-icon class="ml-2">mdi-map</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" lg="2">
            <v-btn class="ml-2" @click="viewRespondents">
              {{ $t('respondents') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="8">
            {{ $t('hierarchy') }}: <GeoBreadcrumbs v-if="geo.id" :geoId="geo.id"></GeoBreadcrumbs>
          </v-col>
          <v-col cols="12" lg="4">
            <GeoTypeSelect
              @geoTypeSelected="onGeoTypeSelected"
              :click-to-edit="hasPermission(TrellisPermission.EDIT_GEO)"
              :readonly="!hasPermission(TrellisPermission.EDIT_GEO)"
              :geo-type="geo.geoType" />
          </v-col>
        </v-row>
        <v-layout column>
          <PhotoAlbum
            :loading="geoPhotosLoading"
            :photos="geoPhotos"
            @photo="addPhoto"
            @delete-photo="onDeletePhoto"
            @update-photos="onUpdatePhotos" />

          <v-flex v-if="hasPermission([TrellisPermission.REMOVE_GEO])">
            <v-toolbar flat>
              <v-toolbar-title>
                {{$t('admin')}}
              </v-toolbar-title>
            </v-toolbar>
            <Permission :requires="TrellisPermission.REMOVE_GEO">
              <v-btn
                @click="removeGeo"
                color="error">
                {{$t('delete')}}
              </v-btn>
            </Permission>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import Translation from '../../entities/trellis/Translation'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import TranslationTextField from '../TranslationTextField'
  import TrellisModal from '../TrellisModal'

  // @ts-ignore
  import GeoBreadcrumbs from './GeoBreadcrumbs'
  // @ts-ignore
  import PhotoAlbum from '../photo/PhotoAlbum'
  // @ts-ignore
  import GeoTypeSelect from './GeoTypeSelect'
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'
  // @ts-ignore
  import Permission from '../Permission'
  import Photo from '../../entities/trellis/Photo'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import GeoService from '../../services/geo/GeoService'
  import router, { routeQueue } from '../../router'
  import { Route } from 'vue-router'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import { SearchFilter } from '../../services/respondent/RespondentServiceInterface'
  import DocsFiles from '../documentation/DocsFiles'

  export default Vue.extend({
    name: 'geo-info',
    mixins: [
      RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
      TranslationMixin,
      DocsLinkMixin(DocsFiles.locations.info),
      PermissionMixin
    ],
    components: {
      GeoBreadcrumbs,
      PhotoAlbum,
      AsyncTranslationText,
      GeoTypeSelect,
      Permission,
      TranslationTextField,
      TrellisModal
    },
    data () {
      return {
        geo: null,
        translation: null,
        error: null,
        geoPhotos: [],
        geoPhotosLoading: true,
        editingGeoType: false
      }
    },
    methods: {
      hydrate: async function (geo: Geo) {
        if (!geo) {
          return this.logError(new Error(`Unable to load location`))
        }
        this.geo = geo
        this.translation = geo.nameTranslation
        this.geoPhotos = await GeoService.getGeoPhotos(geo.id)
        this.geoPhotosLoading = false
      },
      viewRespondents () {
        routeQueue.redirect({
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
        try {
          let photoWithPivotTable = await GeoService.addPhoto(this.geo.id, photo)
          this.geoPhotos.push(photoWithPivotTable)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async onUpdatePhotos (photos) {
        try {
          await GeoService.updatePhotos(photos)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async onDeletePhoto (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await GeoService.removePhoto(photo)
          this.geoPhotos.splice(this.geoPhotos.indexOf(photo), 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      onGeoTypeSelected: async function (geoType) {
        if (geoType.id === this.geo.geoType.id) return
        this.geo.geoTypeId = geoType.id
        this.geo.geoType = geoType
        try {
          GeoService.updateGeo(this.geo)
          this.alert('success', this.$t('resource_updated', [this.$t('geo_type')]))
        } catch (err) {
          this.logError(err)
        }
      },
      updateTranslation (newT: Translation) {
        this.geo.nameTranslation = newT
      },
      removeGeo () {
        if (!confirm(this.$t('confirm_resource_delete', [this.$t('geo')]))) return
        try {
          GeoService.removeGeo(this.geo.id)
          this.alert('success', this.$t('resource_deleted', [this.geo.id]))
          router.go(-1)
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_delete', [this.geo.id]), {timeout: 0})
        }
      },
      showGeoMap () {
        routeQueue.redirect({
          name: 'GeoSearchWithMap',
          params: {
            geoId: this.geo.id
          }
        })
      }
    }
  })
</script>

<style scoped>
  .button-min-height {
    line-height: 40px;
  }
</style>
