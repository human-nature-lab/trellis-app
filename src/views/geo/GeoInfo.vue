<template>
  <v-container>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>
          <AsyncTranslationText :translation="geo.nameTranslation" />
        </v-toolbar-title>
        <v-spacer />
        <DotsMenu>
          <v-list-item @click="viewRespondents">
            <v-list-item-icon>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              {{ $t('respondents') }}
            </v-list-item-title>
          </v-list-item>
          <Permission :requires="TrellisPermission.EDIT_GEO">
            <v-list-item
              icon
              small
              @click="showEditName = true"
            >
              <v-list-item-icon>
                <v-icon>mdi-pencil</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                {{ $t('edit') }}
              </v-list-item-title>
            </v-list-item>
          </Permission>
          <v-list-item
            v-if="geo"
            :to="geoMapSearchRoute(geo.id)"
            icon
          >
            <v-list-item-icon>
              <v-icon>mdi-map</v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              {{ $t('location_search_map') }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="geo"
            :to="geoSearchRoute(geo.id)"
            icon
          >
            <v-list-item-icon>
              <v-icon>mdi-magnify</v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              {{ $t('location_search') }}
            </v-list-item-title>
          </v-list-item>
          <Permission
            v-if="isWeb"
            :requires="TrellisPermission.ADD_RESPONDENT_CONDITION_TAG"
          >
            <v-list-item
              @click="showConditionTagAssignDialog = true"
              icon
            >
              <v-list-item-icon>
                <v-icon>mdi-tag</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                {{ $t('add_condition_tag') }}
              </v-list-item-title>
            </v-list-item>
          </Permission>
        </DotsMenu>
      </v-toolbar>
      <v-col
        class="mb-4"
      >
        <v-row
          no-gutters
          class="justify-space-between"
        >
          <v-col>
            <span class="subheading button-min-height">
              {{ $t('location') }}: <GeoBreadcrumbs
                v-if="geo.id"
                :geo-id="geo.id"
              />
            </span>
          </v-col>
          <v-col class="text-right">
            <span class="subheading button-min-height">
              {{ $t('type') }}:
              {{ geo.geoType.name }}
              <Permission :requires="TrellisPermission.EDIT_GEO">
                <v-btn
                  icon
                  small
                  @click="showGeoTypeDialog = true"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </Permission>
            </span>
          </v-col>
        </v-row>
      </v-col>
      <PhotoAlbum
        :loading="geoPhotosLoading"
        :photos="geoPhotos"
        @photo="addPhoto"
        @delete-photo="onDeletePhoto"
        @update-photos="onUpdatePhotos"
      />
      <v-toolbar flat>
        <v-toolbar-title>
          {{ $t('admin') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-col>
        <v-row
          no-gutters
          class="justify-space-between"
        >
          <Permission :requires="TrellisPermission.REMOVE_GEO">
            <v-btn
              @click="removeGeo"
              color="error"
            >
              {{ $t('delete') }}
            </v-btn>
          </Permission>
          <GeoHooks
            v-if="isWeb && geo"
            :geo="geo"
          />
        </v-row>
      </v-col>
    </v-card>
    <TrellisModal
      v-model="showGeoTypeDialog"
      :title="$t('edit_geo_type')"
    >
      <GeoTypeSelector
        @geo-type-selected="onGeoTypeSelected"
        :geo-type="geo.geoType"
      />
    </TrellisModal>
    <TrellisModal
      v-model="showEditName"
      :title="$t('edit_geo_name')"
    >
      <TranslationTextField
        :translation="geo.nameTranslation"
        @save="updateTranslation"
      />
    </TrellisModal>
    <TrellisModal
      v-model="showConditionTagAssignDialog"
      :title="$t('assign_condition_tag')"
    >
      <AssignGeoToConditionTag
        :geo-id="geo.id"
        @done="showConditionTagAssignDialog = false"
      />
    </TrellisModal>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'
import Translation from '@/entities/trellis/Translation'
import PermissionMixin from '@/mixins/PermissionMixin'
import TranslationTextField from '@/components/TranslationTextField.vue'
import TrellisModal from '@/components/TrellisModal.vue'
import GeoBreadcrumbs from '@/components/geo/GeoBreadcrumbs.vue'
import GeoHooks from '@/components/geo/GeoHooks.vue'
import PhotoAlbum from '@/components/photo/PhotoAlbum.vue'
import GeoTypeSelector from '@/components/geo/GeoTypeSelector.vue'
import AsyncTranslationText from '@/components/AsyncTranslationText.vue'
import Permission from '@/components/Permission.vue'
import Photo from '@/entities/trellis/Photo'
import TranslationMixin from '@/mixins/TranslationMixin'
import RouteMixinFactory from '@/mixins/RoutePreloadMixin'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import GeoService from '@/services/geo'
import router, { routeQueue } from '@/router'
import Geo from '@/entities/trellis/Geo'
import { SearchFilter } from '@/services/respondent/RespondentServiceInterface'
import DocsFiles from '@/components/documentation/DocsFiles'
import { computedTitle } from '@/router/history'
import { geoSearchRoute, geoMapSearchRoute } from '@/router/util'
import AssignGeoToConditionTag from '@/components/geo/AssignGeoToConditionTag.vue'
import DotsMenu from '@/components/util/DotsMenu.vue'

export default Vue.extend({
  name: 'GeoInfo',
  mixins: [
    RouteMixinFactory((r: Route) => GeoService.getGeoById(r.params.geoId)),
    TranslationMixin,
    DocsLinkMixin(DocsFiles.locations.info),
    PermissionMixin,
  ],
  components: {
    GeoBreadcrumbs,
    GeoHooks,
    PhotoAlbum,
    AsyncTranslationText,
    GeoTypeSelector,
    Permission,
    TranslationTextField,
    TrellisModal,
    AssignGeoToConditionTag,
    DotsMenu,
  },
  data () {
    return {
      geo: null,
      translation: null,
      error: null,
      geoPhotos: [],
      geoPhotosLoading: true,
      showGeoTypeDialog: false,
      showEditName: false,
      showConditionTagAssignDialog: false,
    }
  },
  created () {
    computedTitle('Geo', () => {
      if (this.translated) {
        return { key: 'geo_info_for', args: [this.translated] }
      }
      return { key: 'geo_info' }
    })
  },
  methods: {
    geoSearchRoute,
    geoMapSearchRoute,
    hydrate: async function (geo: Geo) {
      if (!geo) {
        return this.logError(new Error('Unable to load location'))
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
            includeChildren: true,
          } as SearchFilter),
        },
      })
    },
    async addPhoto (photo: Photo) {
      try {
        const photoWithPivotTable = await GeoService.addPhoto(this.geo.id, photo)
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
      const confirmMessage = this.$t('remove_photo_confirm') + ''
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
        this.logError(err)
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
        this.alert('error', this.$t('failed_resource_delete', [this.geo.id]), { timeout: 0 })
      }
    },
  },
})
</script>

<style scoped>
  .button-min-height {
    line-height: 40px;
  }
</style>
