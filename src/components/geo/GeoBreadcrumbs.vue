<template>
  <span class="geo-breadcrumbs">
    <span v-if="error" class="error">
      {{error}}
    </span>
    <span v-else-if="isLoading">
      Loading...
    </span>
    <span v-else>
      <router-link
        class="geo-name"
        :to="{name: 'Geo', params: {geoId: geo.id}}"
        v-for="geo in ancestors"
        :key="geo.id">
        {{translate(geo)}}
      </router-link>
    </span>
  </span>
</template>

<script>
  import GeoService from '../../services/geo/GeoService'
  import TranslationService from '../../services/TranslationService'
  export default {
    name: 'geo-breadcrumbs',
    props: {
      geoId: {
        type: String
      },
      showAncestors: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        error: null,
        isLoading: false,
        ancestors: []
      }
    },
    created () {
      this.load()
    },
    watch: {
      geoId () {
        this.load()
      }
    },
    methods: {
      translate (geo) {
        return TranslationService.getAny(geo.name_translation, this.global.locale.id)
      },
      load () {
        if (!this.geoId) return
        this.isLoading = true
        GeoService.getGeoAncestors(this.geoId).then(ancestors => {
          this.ancestors = ancestors
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.isLoading = false
        })
      }
    }
  }
</script>

<style lang="sass" scoped>
  .error
    color: red
  .geo-name:not(:first-child):before
    content: ' > '
</style>
