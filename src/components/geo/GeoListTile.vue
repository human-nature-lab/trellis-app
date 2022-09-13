<template>
  <v-list-item
    @click="$emit('click')"
    :disabled="disabled"
  >
    <v-list-item-avatar :tile="true">
      <Photo
        :photo="primaryPhoto"
        :is-building="true"
        height="50"
        width="50"
      />
    </v-list-item-avatar>
    <v-list-item-action v-if="isSelectable">
      <v-btn
        icon
        @click.stop="$emit('geo-select')"
        :disabled="disabled"
      >
        <v-icon
          color="primary"
          v-if="selected"
        >
          mdi-checkbox-marked
        </v-icon>
        <v-icon v-else>
          mdi-checkbox-blank-outline
        </v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-content>
      {{ this.translated }}
    </v-list-item-content>
    <v-list-item-action>
      <v-btn
        @click.stop="showGeoMap"
        :disabled="disabled"
        icon
      >
        <v-icon>mdi-map</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-action>
      <v-btn
        @click.stop="showGeoInfo"
        :disabled="disabled"
        icon
      >
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import TranslationMixin from '../../mixins/TranslationMixin'
import { routeQueue } from '../../router'
import Photo from '../photo/Photo.vue'
import Geo from '../../entities/trellis/Geo'
export default {
  name: 'GeoListTile',
  props: {
    geo: {
      type: Geo,
      required: true,
    },
    disabled: Boolean,
    selected: {
      type: Boolean,
      default: false,
    },
    isSelectable: {
      type: Boolean,
      default: false,
    },
    showInfoView: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    primaryPhoto: function () {
      return this.geo.photos.length ? this.geo.photos[0] : {}
    },
    translation: function () {
      return this.geo.nameTranslation || null
    },
  },
  methods: {
    showGeoMap () {
      routeQueue.redirect({
        name: 'GeoSearchWithMap',
        params: {
          geoId: this.geo.id,
        },
      })
    },
    showGeoInfo () {
      routeQueue.redirect({
        name: 'Geo',
        params: {
          geoId: this.geo.id,
        },
      })
    },
  },
  mixins: [TranslationMixin],
  components: {
    Photo,
  },
}
</script>
