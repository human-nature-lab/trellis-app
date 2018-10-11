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
        <AsyncTranslationText :translation="geo.nameTranslation"></AsyncTranslationText>
      </router-link>
    </span>
  </span>
</template>

<script>
  import AsyncTranslationText from '../AsyncTranslationText'
  import GeoService from '../../services/geo/GeoService'
  import singleton from '../../static/singleton'
  export default {
    name: 'geo-breadcrumbs',
    props: {
      geoId: {
        type: String,
        required: true
      },
      showAncestors: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        global: singleton,
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
      load () {
        if (!this.geoId) return
        this.isLoading = true
        GeoService.getGeoAncestors(this.geoId).then(ancestors => {
          this.ancestors = ancestors
          console.log('ancestors', ancestors)
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.isLoading = false
        })
      }
    },
    components: {AsyncTranslationText}
  }
</script>

<style lang="sass" scoped>
  .error
    color: red
  .geo-breadcrumbs
    .geo-name:not(:first-child):before
      content: ' \\ '
</style>
