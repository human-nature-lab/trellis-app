<template>
  <v-flex xs12>
    <v-card>
      <v-toolbar card prominent>
        <v-toolbar-title>
          <AsyncTranslationText :translation="geo.nameTranslation"/>
          <Permission :requires="TrellisPermission.EDIT_GEO">
            <v-btn icon small @click="showEditName = true">
              <v-icon>edit</v-icon>
            </v-btn>
          </Permission>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          @click.stop="showGeoMap"
          icon>
          <v-icon>map</v-icon>
        </v-btn>
        <v-btn @click="viewRespondents">
          {{ $t('respondents') }}
        </v-btn>
      </v-toolbar>
      <v-container>
        <v-layout wrap class="mb-3">
          <v-flex>
            <span class="subheading button-min-height">
              {{ $t('location') }}: <GeoBreadcrumbs v-if="geo.id" :geoId="geo.id"></GeoBreadcrumbs>
            </span>
          </v-flex>
          <v-spacer />
          <v-flex class="text-xs-right">
            <span class="subheading button-min-height">
              {{ $t('type') }}:
              {{ geo.geoType.name }}
              <Permission :requires="TrellisPermission.EDIT_GEO">
                <v-btn
                  icon
                  small
                  @click="showGeoTypeDialog = true">
                  <v-icon>edit</v-icon>
                </v-btn>
              </Permission>
            </span>
          </v-flex>
        </v-layout>
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
    <TrellisModal
      v-model="showGeoTypeDialog"
      :title="$t('edit_geo_type')">
      <GeoTypeSelector
        v-on:geo-type-selected="onGeoTypeSelected"
        :geoType="geo.geoType" />
    </TrellisModal>
    <TrellisModal
      v-model="showEditName"
      :title="$t('edit_geo_name')">
      <TranslationTextField
        :translation="geo.nameTranslation"
        @save="updateTranslation" />
    </TrellisModal>
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
      GeoTypeSelector,
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
        showGeoTypeDialog: false,
        showEditName: false
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
        } catch (err) {
          console.error(err)
        } finally {
          this.showGeoTypeDialog = false
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
